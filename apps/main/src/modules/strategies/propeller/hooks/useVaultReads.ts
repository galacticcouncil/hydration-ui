import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import {
  ERC20_ABI,
  ETH_ADDRESS,
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
      const safeRead = async (
        label: string,
        read: () => Promise<bigint>,
      ): Promise<bigint | null> => {
        try {
          return await read()
        } catch (err) {
          if (import.meta.env.DEV) {
            console.warn(`[propeller-vault] SubLoop.${label} reverted`, err)
          }
          return null
        }
      }
      const [healthFactor, totalEquity] = await Promise.all([
        safeRead("healthFactor", () => subLoop.read.healthFactor()),
        safeRead("totalEquity", () => subLoop.read.totalEquity()),
      ])
      return {
        healthFactor:
          healthFactor === null ? null : Number(formatUnits(healthFactor, 18)),
        totalEquity:
          totalEquity === null ? null : Number(formatUnits(totalEquity, 18)),
      }
    },
    refetchInterval: 30_000,
  })
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
