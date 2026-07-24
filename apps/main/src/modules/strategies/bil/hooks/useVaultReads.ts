import { EVM_DECIMALS } from "@galacticcouncil/web3-connect/src/config/evm"
import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { secondsInDay } from "date-fns/constants"
import { formatUnits, getContract, type Hex, parseUnits } from "viem"

import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"
import {
  BIL_ATOKEN_ADDRESS,
  BIL_HAS_AAVE_LAYER,
  BIL_POOL_ABI,
  BIL_POOL_ADDRESS,
  DCL_PRECOMPILE_ADDRESS,
  DECENTRAL_POOL_ABI,
  ERC20_ABI,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/bil/constants"
import { useBilVaultContract } from "@/modules/strategies/bil/hooks/useBilVaultContract"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"

export type VaultStats = {
  totalAssets: number
  totalSupply: number
  exchangeRate: number
  worstCaseWaitDays: number
  nextMaturityDays: number
  maxLockupDays: number
  tvlCap: number
  paused: boolean
  depositsPaused: boolean
  minDeposit: number
  minRedeem: number
  apr: number
  /**
   * Aave pool supply cap for the BIL reserve, in whole BIL. `0` means either
   * "no Aave layer on this network" or "cap disabled" (Aave treats 0 as
   * uncapped) — in both cases the pool imposes no ceiling.
   */
  supplyCapBil: number
  /** BIL currently supplied to the Aave pool (aToken total supply). */
  suppliedBil: number
  /**
   * How much HOLLAR a new deposit can still take, in HOLLAR. This is the
   * *lower* of the two live ceilings a deposit must clear atomically:
   *   - vault `tvlCap`     → `tvlCap - totalAssets`               (HOLLAR)
   *   - pool `supplyCap`   → `(supplyCap - suppliedBil) * rate`   (HOLLAR)
   * The deposit zap does `vault.deposit` then `pool.supply` in one tx, so
   * whichever binds first reverts the whole thing. The UI caps input here.
   */
  remainingDepositHollar: number
  /** Which ceiling is currently binding — drives the "remaining" copy. */
  depositLimitBinding: "vault" | "pool"
}

const DEFAULT_VAULT_STATS: VaultStats = {
  totalAssets: 0,
  totalSupply: 0,
  exchangeRate: 1,
  worstCaseWaitDays: 0,
  nextMaturityDays: 0,
  maxLockupDays: 62,
  tvlCap: 0,
  paused: false,
  depositsPaused: false,
  minDeposit: 10,
  minRedeem: 1,
  apr: 18,
  supplyCapBil: 0,
  suppliedBil: 0,
  remainingDepositHollar: 0,
  depositLimitBinding: "vault",
}

export function useVaultStats() {
  const { evm } = useRpcProvider()
  const { data: vault } = useBilVaultContract()
  return useQuery({
    queryKey: bilQueryKeys.vaultStats(),
    enabled: !!vault,
    initialData: DEFAULT_VAULT_STATS,
    queryFn: async () => {
      if (!vault) throw new Error("Vault contract not found")
      const [
        totalAssets,
        totalSupply,
        exchangeRateWad,
        tvlCap,
        paused,
        depositsPaused,
        minReinvest,
        minRedeem,
        apyWad,
        queueLength,
        idleHollar,
        positionCount,
        positionHead,
      ] = await Promise.all([
        vault.read.totalAssets(),
        vault.read.totalSupply(),
        vault.read.exchangeRate(),
        vault.read.tvlCap(),
        vault.read.paused(),
        vault.read.depositsPaused(),
        vault.read.minReinvestAmount(),
        vault.read.minRedeemAmount(),
        vault.read.getAPYWad(),
        vault.read.getRedemptionQueueLength(),
        vault.read.getIdleHollar(),
        vault.read.getPositionCount(),
        vault.read.getPositionHead(),
      ])

      // The old vault exposed a flat `withdrawalDelay()` (48h buffer between
      // request and fulfilment). That was removed in commit 47b7041 — the
      // queue settles as positions mature, no separate redemption delay.
      // So worst-case-wait now folds back to:
      //   - if queue non-empty: `getEstimatedWaitTime` for the tail request
      //   - else if no idle HOLLAR: time until next position maturity
      //   - else: 0 (settles immediately on next pokeQueue)
      let worstCaseWaitSec = 0n
      let nextMaturitySec = 0n
      const now = BigInt(Math.floor(Date.now() / 1000))

      if (positionCount > positionHead) {
        const [, , , , maturityTime] = await vault.read.getPosition([
          positionHead,
        ])
        if (maturityTime > now) {
          nextMaturitySec = maturityTime - now
        }
      }

      if (queueLength > 0n) {
        worstCaseWaitSec = await vault.read.getEstimatedWaitTime([
          queueLength - 1n,
        ])
      } else if (idleHollar === 0n && nextMaturitySec > 0n) {
        worstCaseWaitSec = nextMaturitySec
      }

      // Maximum lockup a *new* deposit can face — regardless of current
      // queue contention. A fresh deposit creates a new Decentral position
      // that has to run for at least `minimumInvestmentPeriodSeconds`
      // before it matures. The previously-added 48h `withdrawalDelay` no
      // longer applies (see above).
      const decentralPoolAddr = await vault.read.activeDepositPool()
      const investmentPeriodSec = await evm.readContract({
        address: decentralPoolAddr,
        abi: DECENTRAL_POOL_ABI,
        functionName: "minimumInvestmentPeriodSeconds",
      })

      // Aave pool supply cap for the BIL reserve. A deposit is atomically
      // `vault.deposit` + `pool.supply` (see BILDepositZap), so the pool cap
      // binds alongside the vault's `tvlCap`. Only read it when the Aave
      // layer is live — on vault-only networks the pool address is inert.
      let supplyCapBil = 0
      let suppliedBil = 0
      if (BIL_HAS_AAVE_LAYER) {
        const [config, aTokenSupply] = await Promise.all([
          evm.readContract({
            address: BIL_POOL_ADDRESS,
            abi: BIL_POOL_ABI,
            functionName: "getConfiguration",
            // The reserve is the DCL precompile (asset 550); the aToken
            // (asset 55) alias is not a registered reserve.
            args: [DCL_PRECOMPILE_ADDRESS],
          }),
          evm.readContract({
            address: BIL_ATOKEN_ADDRESS,
            abi: ERC20_ABI,
            functionName: "totalSupply",
          }),
        ])
        // Aave V3 packs the supply cap into bits 116-151 of the reserve
        // config (36 bits, whole tokens, no decimals). 0 == uncapped.
        supplyCapBil = Number((config.data >> 116n) & 0xfffffffffn)
        suppliedBil = Number(formatUnits(aTokenSupply, EVM_DECIMALS))
      }

      const totalAssetsNum = Number(formatUnits(totalAssets, EVM_DECIMALS))
      const tvlCapNum = Number(formatUnits(tvlCap, EVM_DECIMALS))
      const exchangeRate = Number(formatUnits(exchangeRateWad, EVM_DECIMALS))

      // Vault ceiling, in HOLLAR: room left under tvlCap.
      const vaultRemainingHollar = Math.max(0, tvlCapNum - totalAssetsNum)
      // Pool ceiling, in HOLLAR: room left under supplyCap, priced from BIL
      // back to HOLLAR via the exchange rate (a deposit of H HOLLAR supplies
      // ~H/rate BIL). Uncapped (supplyCap 0 / no Aave layer) → Infinity.
      const poolRemainingHollar =
        BIL_HAS_AAVE_LAYER && supplyCapBil > 0
          ? Math.max(0, supplyCapBil - suppliedBil) * exchangeRate
          : Infinity
      const remainingDepositHollar = Math.min(
        vaultRemainingHollar,
        poolRemainingHollar,
      )
      const depositLimitBinding: "vault" | "pool" =
        poolRemainingHollar < vaultRemainingHollar ? "pool" : "vault"

      return {
        totalAssets: totalAssetsNum,
        totalSupply: Number(formatUnits(totalSupply, EVM_DECIMALS)),
        exchangeRate,
        worstCaseWaitDays: Math.round(Number(worstCaseWaitSec) / secondsInDay),
        nextMaturityDays: Math.round(Number(nextMaturitySec) / secondsInDay),
        maxLockupDays: Math.ceil(Number(investmentPeriodSec) / secondsInDay),
        tvlCap: tvlCapNum,
        paused,
        depositsPaused,
        minDeposit: Number(formatUnits(minReinvest, EVM_DECIMALS)),
        minRedeem: Number(formatUnits(minRedeem, EVM_DECIMALS)),
        apr: Number(formatUnits(apyWad, 16)),
        supplyCapBil,
        suppliedBil,
        remainingDepositHollar,
        depositLimitBinding,
      } satisfies VaultStats
    },
  })
}

export function useUserBalances(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  const { hollar, bil } = useBilStrategy()
  return useQuery({
    queryKey: bilQueryKeys.vaultBalances(evmAddress),
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { hollar: 0, bil: 0 }

      const hollarToken = getContract({
        address: HOLLAR_ADDRESS,
        abi: ERC20_ABI,
        client: evm,
      })
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })

      // Each balance read is wrapped independently — on partial-deploy
      // environments any one of these contracts (HOLLAR token, vault,
      // aToken) might not be reachable, and a single revert in a Promise.all
      // would otherwise wipe the whole query and make the UI render 0 BIL.
      // Each failure is logged so the cause is visible in dev.
      const safeBalance = async (
        label: string,
        read: () => Promise<bigint>,
      ) => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(
              `[bil-vault] ${label}.balanceOf reverted — treating as 0. ` +
                `Likely the contract isn't deployed/initialized at the configured address on this network.`,
              err,
            )
          }
          return 0n
        }
      }

      // aBIL only exists when the Aave money-market layer is deployed.
      // On lark-2 (vault-only) we skip the read entirely so we don't spam
      // dev warnings against the zero address.
      const aTokenRead: Promise<bigint> = BIL_HAS_AAVE_LAYER
        ? safeBalance("BIL aToken", () =>
            getContract({
              address: BIL_ATOKEN_ADDRESS,
              abi: ERC20_ABI,
              client: evm,
            }).read.balanceOf([evmAddress]),
          )
        : Promise.resolve(0n)

      const [hollarBal, vaultBal, aTokenBal] = await Promise.all([
        safeBalance("HOLLAR", () => hollarToken.read.balanceOf([evmAddress])),
        safeBalance("BIL vault", () => vault.read.balanceOf([evmAddress])),
        aTokenRead,
      ] as const)

      return {
        hollar: Number(formatUnits(hollarBal, hollar.decimals)),
        bil: Number(formatUnits(vaultBal + aTokenBal, bil.decimals)),
        // Surface the split so callers that need to know where it sits
        // (e.g. the future batched-withdraw flow) can branch on it.
        bilRaw: Number(formatUnits(vaultBal, bil.decimals)),
        bilSupplied: Number(formatUnits(aTokenBal, bil.decimals)),
      }
    },
  })
}

/**
 * Predicted BIL minted for a given HOLLAR deposit, read from the vault's
 * `previewDeposit` view. The difference between input HOLLAR and
 * `output × exchangeRate` is the deposit fee in HOLLAR (≈ USD, since
 * HOLLAR is $-pegged). Caller is responsible for debouncing the input.
 *
 * Note: at the lark-2 vault version (commit 555abc7), `previewDeposit`
 * reverts on inputs where the actual `deposit` would revert
 * (ZeroAmount / DepositTooSmall / VaultEmpty) instead of returning 0.
 * That is per ERC-4626 §previewDeposit. We swallow the revert here and
 * return 0 so the fees row in the deposit panel doesn't blow up the
 * whole query.
 */
export function usePreviewDeposit(hollarAmount: number) {
  const { evm } = useRpcProvider()
  const { hollar, bil } = useBilStrategy()
  return useQuery({
    queryKey: bilQueryKeys.vaultPreviewDeposit(hollarAmount),
    enabled: hollarAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })
      try {
        const result = await vault.read.previewDeposit([
          parseUnits(hollarAmount.toString(), hollar.decimals),
        ])
        return Number(formatUnits(result, bil.decimals))
      } catch {
        // Input below the dust threshold or vault empty — no preview to
        // show. Caller treats this as "fee unknown" and shows the
        // standard form-validation error from the input itself.
        return 0
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

/**
 * Predicted HOLLAR received for a given BIL redeem, read from the vault's
 * `previewRedeem` view. The difference between `input × exchangeRate` and
 * the returned HOLLAR is the redeem fee.
 */
export function usePreviewRedeem(bilAmount: number) {
  const { evm } = useRpcProvider()
  const { hollar, bil } = useBilStrategy()
  return useQuery({
    queryKey: bilQueryKeys.vaultPreviewRedeem(bilAmount),
    enabled: bilAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })
      const result = await vault.read.previewRedeem([
        parseUnits(bilAmount.toString(), bil.decimals),
      ])
      return Number(formatUnits(result, hollar.decimals))
    },
    placeholderData: keepPreviousData,
    staleTime: 15_000,
  })
}

/**
 * Whether the connected wallet has opted into keeper-driven auto-claim.
 * Toggled via `useSetAutoClaim`. When true, a CLAIM_OPERATOR_ROLE holder
 * (the keeper bot) will call `redeem` on the user's behalf as soon as
 * their settled inventory is non-zero — funds go to the controller's own
 * address.
 */
export function useAutoClaimEnabled(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: bilQueryKeys.vaultAutoclaim(evmAddress),
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return false
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })
      return vault.read.autoClaimEnabled([evmAddress])
    },
  })
}
