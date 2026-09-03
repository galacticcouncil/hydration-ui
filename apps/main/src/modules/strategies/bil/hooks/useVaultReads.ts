import { EVM_DECIMALS } from "@galacticcouncil/web3-connect/src/config/evm"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { secondsInDay } from "date-fns/constants"
import { type Address, formatUnits, getContract } from "viem"

import {
  BIL_POOL_ABI,
  DECENTRAL_POOL_ABI,
  ERC20_ABI,
  VAULT_ABI,
} from "@/modules/strategies/bil/config/abi"
import {
  BIL_ATOKEN_ADDRESS,
  BIL_POOL_ADDRESS,
  DCL_PRECOMPILE_ADDRESS,
  HOLLAR_ADDRESS,
  VAULT_ADDRESS,
} from "@/modules/strategies/bil/config/constants"
import { useBilStrategy } from "@/modules/strategies/bil/context/BilStrategyContext"
import { bilVaultContractQuery } from "@/modules/strategies/bil/hooks/useBilVaultContract"
import { bilQueryKeys } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"

export type UserBalances = {
  hollar: string
  bil: string
  bilRaw: string
  bilSupplied: string
}

const DEFAULT_USER_BALANCES: UserBalances = {
  hollar: "0",
  bil: "0",
  bilRaw: "0",
  bilSupplied: "0",
}

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
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  return useQuery({
    queryKey: bilQueryKeys.vaultStats(),
    enabled: rpc.isReady,
    initialData: DEFAULT_VAULT_STATS,
    queryFn: async () => {
      const vault = await queryClient.ensureQueryData(
        bilVaultContractQuery(rpc),
      )
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
        queueHead,
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
        vault.read.getQueueHead(),
        vault.read.getIdleHollar(),
        vault.read.getPositionCount(),
        vault.read.getPositionHead(),
      ])

      // There is no separate redemption delay — the queue settles as
      // positions mature.
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

      // Estimate wait for a new queue entry: scan active slots plus the
      // append index. getEstimatedWaitTime often returns 0 for settled/
      // claimable requests, so floor on next maturity when idle HOLLAR is 0.
      if (queueLength > queueHead) {
        worstCaseWaitSec = await vault.read.getEstimatedWaitTime([queueLength])
        for (let i = queueHead; i < queueLength; i++) {
          const wait = await vault.read.getEstimatedWaitTime([i])
          if (wait > worstCaseWaitSec) worstCaseWaitSec = wait
        }
      }

      if (
        idleHollar === 0n &&
        nextMaturitySec > 0n &&
        worstCaseWaitSec < nextMaturitySec
      ) {
        worstCaseWaitSec = nextMaturitySec
      }

      // Max lockup a *new* deposit faces, regardless of queue contention.
      // The active deposit pool is read on-chain, not from a local constant.
      const decentralPoolAddr = await vault.read.activeDepositPool()
      const investmentPeriodSec = await rpc.evm.readContract({
        address: decentralPoolAddr,
        abi: DECENTRAL_POOL_ABI,
        functionName: "minimumInvestmentPeriodSeconds",
      })

      // Aave pool supply cap for the BIL reserve. A deposit is atomically
      // `vault.deposit` + `pool.supply` (see BILDepositZap), so the pool cap
      // binds alongside the vault's `tvlCap`.
      const [config, aTokenSupply] = await Promise.all([
        rpc.evm.readContract({
          address: BIL_POOL_ADDRESS,
          abi: BIL_POOL_ABI,
          functionName: "getConfiguration",
          // The reserve is the DCL precompile (asset 550); the aToken
          // (asset 55) alias is not a registered reserve.
          args: [DCL_PRECOMPILE_ADDRESS],
        }),
        rpc.evm.readContract({
          address: BIL_ATOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: "totalSupply",
        }),
      ])
      // Aave V3 packs the supply cap into bits 116-151 of the reserve
      // config (36 bits, whole tokens, no decimals). 0 == uncapped.
      const supplyCapBil = Number((config.data >> 116n) & 0xfffffffffn)
      const suppliedBil = Number(formatUnits(aTokenSupply, EVM_DECIMALS))

      const totalAssetsNum = Number(formatUnits(totalAssets, EVM_DECIMALS))
      const tvlCapNum = Number(formatUnits(tvlCap, EVM_DECIMALS))
      const exchangeRate = Number(formatUnits(exchangeRateWad, EVM_DECIMALS))

      const vaultRemainingHollar = Math.max(0, tvlCapNum - totalAssetsNum)
      // Pool ceiling, in HOLLAR: room left under supplyCap, priced from BIL
      // back to HOLLAR via the exchange rate (a deposit of H HOLLAR supplies
      // ~H/rate BIL). Uncapped (supplyCap 0) → Infinity.
      const poolRemainingHollar =
        supplyCapBil > 0
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
        worstCaseWaitDays: Math.ceil(Number(worstCaseWaitSec) / secondsInDay),
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

export function useUserBalances(evmAddress: string | undefined) {
  const { evm } = useRpcProvider()
  const { hollar, bil } = useBilStrategy()
  return useQuery({
    queryKey: bilQueryKeys.vaultBalances(evmAddress),
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return DEFAULT_USER_BALANCES

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

      const address = evmAddress as Address

      const [hollarBal, vaultBal, aTokenBal] = await Promise.all([
        safeBalance("HOLLAR", () => hollarToken.read.balanceOf([address])),
        safeBalance("BIL vault", () => vault.read.balanceOf([address])),
        safeBalance("BIL aToken", () =>
          getContract({
            address: BIL_ATOKEN_ADDRESS,
            abi: ERC20_ABI,
            client: evm,
          }).read.balanceOf([address]),
        ),
      ] as const)

      return {
        hollar: formatUnits(hollarBal, hollar.decimals),
        bil: formatUnits(vaultBal + aTokenBal, bil.decimals),
        // Surface the split so callers that need to know where it sits
        // (e.g. the future batched-withdraw flow) can branch on it.
        bilRaw: formatUnits(vaultBal, bil.decimals),
        bilSupplied: formatUnits(aTokenBal, bil.decimals),
      } satisfies UserBalances
    },
  })
}

/**
 * Whether the connected wallet has opted into keeper-driven auto-claim.
 * Toggled via `useSetAutoClaim`. When true, a CLAIM_OPERATOR_ROLE holder
 * (the keeper bot) will call `redeem` on the user's behalf as soon as
 * their settled inventory is non-zero — funds go to the controller's own
 * address.
 */
export function useAutoClaimEnabled(evmAddress: string | undefined) {
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
      return vault.read.autoClaimEnabled([evmAddress as Address])
    },
  })
}
