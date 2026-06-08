import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import { usePRIMEAPY } from "@/api/external/kamino"
import {
  ERC20_ABI,
  ETH_ADDRESS,
  HOLLAR_ADDRESS,
  POOL_ABI,
  POOL_ADDRESS,
  SUBLOOP_ABI,
  SUBLOOP_ADDRESS,
  VAULT_ABI,
  VAULT_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { usePropellerVaultContract } from "@/modules/strategies/propeller/hooks/usePropellerVaultContract"
import { useRpcProvider } from "@/providers/rpcProvider"

// Propeller doesn't expose an on-chain APR view (no getAPYWad), and there's
// no Decentral-style maturity schedule — the redeem queue settles as the
// keeper unwinds the loop. These are first-paint UI fallbacks; the live
// numbers users care about (exchangeRate, queued shares) come from chain.
const FALLBACK_APR = 0
const FALLBACK_MIN_DEPOSIT = 0
const FALLBACK_MIN_REDEEM = 0

export function useVaultStats() {
  const { data: vault } = usePropellerVaultContract()
  return useQuery({
    queryKey: ["propeller-vault-stats"],
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
        queueHead,
        queueTail,
      ] = await Promise.all([
        vault.read.totalAssets(),
        vault.read.totalSupply(),
        vault.read.exchangeRate(),
        vault.read.tvlCap(),
        vault.read.paused(),
        vault.read.depositsPaused(),
        vault.read.queueHead(),
        vault.read.queueTail(),
      ])

      const queueLength = queueTail > queueHead ? queueTail - queueHead : 0n

      return {
        totalAssets: Number(formatUnits(totalAssets, 18)),
        totalSupply: Number(formatUnits(totalSupply, 18)),
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        queueLength: Number(queueLength),
        tvlCap: Number(formatUnits(tvlCap, 18)),
        paused,
        depositsPaused,
        minDeposit: FALLBACK_MIN_DEPOSIT,
        minRedeem: FALLBACK_MIN_REDEEM,
        apr: FALLBACK_APR,
      }
    },
    refetchInterval: 30_000,
  })
}

/**
 * SubLoop leverage/health read — drives the optional "Health factor" detail
 * line. Both values are WAD-scaled (1e18). Wrapped independently so a revert
 * on a partial deploy doesn't wipe the strategy page.
 */
export function useSubLoopStats() {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["propeller-subloop-stats"],
    queryFn: async () => {
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const pool = getContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        client: evm,
      })
      const safe = async <T>(
        label: string,
        read: () => Promise<T>,
      ): Promise<T | null> => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(`[propeller-vault] ${label} reverted`, err)
          }
          return null
        }
      }
      const [healthFactor, totalEquity, targetHf, account, hollarRes] =
        await Promise.all([
          safe("SubLoop.healthFactor", () => subLoop.read.healthFactor()),
          safe("SubLoop.totalEquity", () => subLoop.read.totalEquity()),
          safe("SubLoop.targetHf", () => subLoop.read.targetHf()),
          safe("Pool.getUserAccountData", () =>
            pool.read.getUserAccountData([SUBLOOP_ADDRESS]),
          ),
          safe("Pool.getReserveData(HOLLAR)", () =>
            pool.read.getReserveData([HOLLAR_ADDRESS]),
          ),
        ])

      // leverage = collateral / equity. borrowRate = the HOLLAR variable borrow
      // rate (Aave rates are ray, 1e27) as a fraction. The PRIME supply leg of
      // the carry is sourced off-chain (Kamino, same as the borrow page) — the
      // Aave testnet liquidity rate reads ~0 and doesn't reflect PRIME's yield.
      let leverage: number | null = null
      let borrowRate: number | null = null
      if (account) {
        const equity = account[0] - account[1] // totalCollateralBase − totalDebtBase
        if (equity > 0n) {
          leverage = Number(account[0]) / Number(equity)
        }
      }
      if (hollarRes) {
        borrowRate = Number(hollarRes.currentVariableBorrowRate) / 1e27
      }

      return {
        healthFactor:
          healthFactor === null ? null : Number(formatUnits(healthFactor, 18)),
        targetHf: targetHf === null ? null : Number(formatUnits(targetHf, 18)),
        totalEquity:
          totalEquity === null ? null : Number(formatUnits(totalEquity, 18)),
        leverage,
        borrowRate,
      }
    },
    refetchInterval: 30_000,
  })
}

/**
 * Live net APY for the loop = leveraged PRIME supply yield minus the HOLLAR
 * borrow cost: primeYield·L − borrowRate·(L−1). The PRIME yield comes from the
 * same Kamino feed the borrow page uses (usePRIMEAPY, a percent → /100 to a
 * fraction). Returns null — never 0 or a negative — when any input is missing
 * or the carry isn't positive, so the UI can simply hide it.
 */
export function usePropellerApy(): number | null {
  const { data: subLoop } = useSubLoopStats()
  const { data: primeApyPct } = usePRIMEAPY({ enabled: true })

  const leverage = subLoop?.leverage ?? null
  const borrowRate = subLoop?.borrowRate ?? null
  if (leverage === null || borrowRate === null || primeApyPct === undefined) {
    return null
  }
  const primeYield = primeApyPct / 100 // percent → fraction
  const apr = primeYield * leverage - borrowRate * (leverage - 1)
  return apr > 0 ? apr : null
}

export function useUserBalances(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["propeller-vault-balances", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { eth: 0, shares: 0 }

      const ethToken = getContract({
        address: ETH_ADDRESS,
        abi: ERC20_ABI,
        client: evm,
      })
      const vault = getContract({
        address: VAULT_ADDRESS,
        abi: VAULT_ABI,
        client: evm,
      })

      // Each balance read is wrapped independently — on partial-deploy
      // environments any one contract might not be reachable, and a single
      // revert in a Promise.all would wipe the whole query.
      const safeBalance = async (
        label: string,
        read: () => Promise<bigint>,
      ) => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(
              `[propeller-vault] ${label}.balanceOf reverted — treating as 0.`,
              err,
            )
          }
          return 0n
        }
      }

      const [ethBal, shareBal] = await Promise.all([
        safeBalance("ETH", () => ethToken.read.balanceOf([evmAddress])),
        safeBalance("pETH vault", () => vault.read.balanceOf([evmAddress])),
      ] as const)

      return {
        eth: Number(formatUnits(ethBal, 18)),
        shares: Number(formatUnits(shareBal, 18)),
      }
    },
    refetchInterval: 15_000,
  })
}

export function useEthAllowance(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  return useQuery({
    queryKey: ["propeller-vault-allowance", evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const ethToken = getContract({
        address: ETH_ADDRESS,
        abi: ERC20_ABI,
        client: evm,
      })
      const allowance = await ethToken.read.allowance([
        evmAddress,
        VAULT_ADDRESS,
      ])
      return Number(formatUnits(allowance, 18))
    },
    refetchInterval: 15_000,
  })
}
