import { keepPreviousData, useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex, parseUnits } from "viem"

import {
  DECENTRAL_POOL_ABI,
  ERC20_ABI,
  HDCL_ATOKEN_ADDRESS,
  HOLLAR_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
  vaultEvmClient,
} from "@/modules/hdcl-vault/constants"

export function useVaultStats() {
  return useQuery({
    queryKey: ["hdcl-vault-stats"],
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
      })

      const [
        totalAssets,
        totalSupply,
        exchangeRateWad,
        withdrawalDelay,
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
        vault.read.withdrawalDelay(),
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

      // Realistic worst-case wait = (time until enough HOLLAR becomes available)
      // + the vault's own withdrawalDelay (the 48h redemption buffer).
      // The contract's getEstimatedWaitTime returns LP maturity + decentral unbonding
      // only — it does NOT add the vault's withdrawalDelay, so we add it here.
      //
      // We also expose `nextMaturitySec` separately — when a vault position
      // next matures, regardless of queue contention. The Withdraw modal's
      // timeline distinguishes "Next maturity" (vault-side liquidity event)
      // from "Est. receive" (your request's actual fulfillment time, which
      // can be later under queue contention).
      let worstCaseWaitSec = withdrawalDelay
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
        const queueWait = await vault.read.getEstimatedWaitTime([
          queueLength - 1n,
        ])
        worstCaseWaitSec = queueWait + withdrawalDelay
      } else if (idleHollar === 0n && nextMaturitySec > 0n) {
        worstCaseWaitSec = nextMaturitySec + withdrawalDelay
      }

      // Maximum lockup a *new* deposit can face — regardless of current
      // queue contention. A fresh deposit creates a new Decentral position
      // that has to run for at least `minimumInvestmentPeriodSeconds`
      // before it matures. After maturity the vault still applies its
      // 48h withdrawalDelay before redeeming. Sum = max upper bound on
      // "if I deposit now, when's the soonest I can have HOLLAR back?".
      //
      // Reads chain: vault.decentralPool() → pool.minimumInvestmentPeriodSeconds().
      // Wrapped defensively because the underlying pool contract may not
      // be reachable on partial-deploy environments — we fall back to
      // worstCaseWaitDays which is already a sensible UI number.
      let maxLockupSec = worstCaseWaitSec
      try {
        const decentralPoolAddr = await vault.read.decentralPool()
        const investmentPeriodSec = await vaultEvmClient.readContract({
          address: decentralPoolAddr,
          abi: DECENTRAL_POOL_ABI,
          functionName: "minimumInvestmentPeriodSeconds",
        })
        maxLockupSec = investmentPeriodSec + withdrawalDelay
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn(
            "[hdcl-vault] could not read minimumInvestmentPeriodSeconds from Decentral pool; " +
              "falling back to worstCaseWaitDays for max-lockup display.",
            err,
          )
        }
      }

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
        apr: Number(formatUnits(apyWad, 16)), // WAD APY → percentage (e.g. 0.18e18 → 18)
      }
    },
    refetchInterval: 30_000,
  })
}

export function useUserBalances(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["hdcl-vault-balances", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { hollar: 0, hdcl: 0 }

      const hollarToken = getContract({
        address: HOLLAR_ADDRESS,
        abi: ERC20_ABI,
        client: vaultEvmClient,
      })
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
      })
      const aToken = getContract({
        address: HDCL_ATOKEN_ADDRESS,
        abi: ERC20_ABI,
        client: vaultEvmClient,
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

      const [hollarBal, vaultBal, aTokenBal] = await Promise.all([
        safeBalance("HOLLAR", () => hollarToken.read.balanceOf([evmAddress])),
        safeBalance("HDCL vault", () => vault.read.balanceOf([evmAddress])),
        safeBalance("HDCL aToken", () => aToken.read.balanceOf([evmAddress])),
      ])

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
 */
export function usePreviewDeposit(hollarAmount: number) {
  return useQuery({
    queryKey: ["hdcl-vault-preview-deposit", hollarAmount],
    enabled: hollarAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
      })
      const result = await vault.read.previewDeposit([
        parseUnits(hollarAmount.toString(), 18),
      ])
      return Number(formatUnits(result, 18))
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
  return useQuery({
    queryKey: ["hdcl-vault-preview-redeem", hdclAmount],
    enabled: hdclAmount > 0,
    queryFn: async () => {
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: vaultEvmClient,
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

export function useHollarAllowance(evmAddress: Hex | undefined) {
  return useQuery({
    queryKey: ["hdcl-vault-allowance", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const hollarToken = getContract({
        address: HOLLAR_ADDRESS,
        abi: ERC20_ABI,
        client: vaultEvmClient,
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
