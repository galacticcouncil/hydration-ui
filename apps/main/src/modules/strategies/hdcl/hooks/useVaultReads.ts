import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex, parseUnits } from "viem"

import {
  DECENTRAL_POOL_ABI,
  ERC20_ABI,
  HDCL_ATOKEN_ADDRESS,
  HDCL_HAS_AAVE_LAYER,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/hdcl/constants"
import { useHdclVaultContract } from "@/modules/strategies/hdcl/hooks/useHdclVaultContract"
import { useRpcProvider } from "@/providers/rpcProvider"

export function useVaultStats() {
  const { evm } = useRpcProvider()
  const { data: vault } = useHdclVaultContract()
  return useQuery({
    queryKey: ["hdcl-vault-stats"],
    enabled: !!vault,
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
      const maxLockupSec = investmentPeriodSec

      return {
        totalAssets: Number(formatUnits(totalAssets, 18)),
        totalSupply: Number(formatUnits(totalSupply, 18)),
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        worstCaseWaitDays: Math.round(Number(worstCaseWaitSec) / 86400),
        nextMaturityDays: Math.round(Number(nextMaturitySec) / 86400),
        maxLockupDays: Math.ceil(Number(maxLockupSec) / 86400),
        tvlCap: Number(formatUnits(tvlCap, 18)),
        paused,
        depositsPaused,
        minDeposit: Number(formatUnits(minReinvest, 18)),
        minRedeem: Number(formatUnits(minRedeem, 18)),
        apr: Number(formatUnits(apyWad, 16)),
      }
    },
    refetchInterval: 30_000,
  })
}

export function useUserBalances(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["hdcl-vault-balances", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { hollar: 0, hdcl: 0 }

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
      // would otherwise wipe the whole query and make the UI render 0 HDCL.
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
              `[hdcl-vault] ${label}.balanceOf reverted — treating as 0. ` +
                `Likely the contract isn't deployed/initialized at the configured address on this network.`,
              err,
            )
          }
          return 0n
        }
      }

      // aHDCL only exists when the Aave money-market layer is deployed.
      // On lark-2 (vault-only) we skip the read entirely so we don't spam
      // dev warnings against the zero address.
      const reads: Array<Promise<bigint>> = [
        safeBalance("HOLLAR", () => hollarToken.read.balanceOf([evmAddress])),
        safeBalance("HDCL vault", () => vault.read.balanceOf([evmAddress])),
      ]
      if (HDCL_HAS_AAVE_LAYER) {
        const aToken = getContract({
          address: HDCL_ATOKEN_ADDRESS,
          abi: ERC20_ABI,
          client: evm,
        })
        reads.push(
          safeBalance("HDCL aToken", () =>
            aToken.read.balanceOf([evmAddress]),
          ),
        )
      } else {
        reads.push(Promise.resolve(0n))
      }
      const [hollarBal, vaultBal, aTokenBal] = await Promise.all(reads)

      return {
        hollar: Number(formatUnits(hollarBal, 18)),
        hdcl: Number(formatUnits(vaultBal + aTokenBal, 18)),
        // Surface the split so callers that need to know where it sits
        // (e.g. the future batched-withdraw flow) can branch on it.
        hdclRaw: Number(formatUnits(vaultBal, 18)),
        hdclSupplied: Number(formatUnits(aTokenBal, 18)),
      }
    },
    refetchInterval: 15_000,
  })
}

/**
 * Predicted HDCL minted for a given HOLLAR deposit, read from the vault's
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
  return useQuery({
    queryKey: ["hdcl-vault-preview-deposit", hollarAmount],
    enabled: hollarAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })
      try {
        const result = await vault.read.previewDeposit([
          parseUnits(hollarAmount.toString(), 18),
        ])
        return Number(formatUnits(result, 18))
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
 * Predicted HOLLAR received for a given HDCL redeem, read from the vault's
 * `previewRedeem` view. The difference between `input × exchangeRate` and
 * the returned HOLLAR is the redeem fee.
 */
export function usePreviewRedeem(hdclAmount: number) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["hdcl-vault-preview-redeem", hdclAmount],
    enabled: hdclAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })
      const result = await vault.read.previewRedeem([
        parseUnits(hdclAmount.toString(), 18),
      ])
      return Number(formatUnits(result, 18))
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
    queryKey: ["hdcl-vault-autoclaim", evmAddress],
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
    refetchInterval: 30_000,
  })
}

export function useHollarAllowance(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["hdcl-vault-allowance", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const hollarToken = getContract({
        address: HOLLAR_ADDRESS,
        abi: ERC20_ABI,
        client: evm,
      })
      const allowance = await hollarToken.read.allowance([
        evmAddress,
        VAULT_ADDRESS,
      ])
      return Number(formatUnits(allowance, 18))
    },
    refetchInterval: 15_000,
  })
}
