import { PRIME_ASSET_ID } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { formatUnits, getContract, type Hex } from "viem"

import { useBorrowAssetsApy } from "@/api/borrow"
import {
  ERC20_ABI,
  HOLLAR_ADDRESS,
  POOL_ABI,
  POOL_ADDRESS,
  SUBLOOP_ABI,
  SUBLOOP_ADDRESS,
  VAULT_ABI,
} from "@/modules/strategies/propeller/constants"
import { usePropellerVaultContract } from "@/modules/strategies/propeller/hooks/usePropellerVaultContract"
import { useActivePropellerVault } from "@/modules/strategies/propeller/PropellerVaultContext"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/vaults"
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
  const { vaultAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-stats", vaultAddress],
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
export function useSubLoopStats(override?: PropellerVaultConfig) {
  const { evm } = useRpcProvider()
  const { vaultAddress } = useActivePropellerVault(override)
  return useQuery({
    queryKey: ["propeller-subloop-stats", vaultAddress],
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
      const [
        healthFactor,
        totalEquity,
        targetHf,
        account,
        vaultAccount,
        hollarRes,
      ] = await Promise.all([
        safe("SubLoop.healthFactor", () => subLoop.read.healthFactor()),
        safe("SubLoop.totalEquity", () => subLoop.read.totalEquity()),
        safe("SubLoop.targetHf", () => subLoop.read.targetHf()),
        safe("Pool.getUserAccountData(SubLoop)", () =>
          pool.read.getUserAccountData([SUBLOOP_ADDRESS]),
        ),
        safe("Pool.getUserAccountData(Vault)", () =>
          pool.read.getUserAccountData([vaultAddress]),
        ),
        safe("Pool.getReserveData(HOLLAR)", () =>
          pool.read.getReserveData([HOLLAR_ADDRESS]),
        ),
      ])

      // leverage = loop collateral / loop equity. borrowExposure = the FULL
      // HOLLAR borrow stack per unit of loop equity — HOLLAR is borrowed twice
      // (the SubLoop's loop leg + the CollateralVault's Main leg), so BOTH legs'
      // interest must be subtracted, not just (leverage − 1). borrowRate = the
      // HOLLAR variable borrow rate (ray, 1e27) as a fraction. The PRIME supply
      // leg of the carry is sourced from the money market's total supply APY.
      let leverage: number | null = null
      let borrowExposure: number | null = null
      let borrowRate: number | null = null
      if (account) {
        const loopColl = account[0]
        const loopDebt = account[1]
        const loopEquity = loopColl - loopDebt // totalCollateralBase − totalDebtBase
        if (loopEquity > 0n) {
          leverage = Number(loopColl) / Number(loopEquity)
          const mainDebt = vaultAccount ? vaultAccount[1] : 0n // vault's HOLLAR debt
          borrowExposure = Number(loopDebt + mainDebt) / Number(loopEquity)
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
        borrowExposure,
        borrowRate,
      }
    },
    refetchInterval: 30_000,
  })
}

/**
 * Live net APY for the loop = leveraged PRIME supply yield minus the FULL HOLLAR
 * borrow cost:  primeYield·leverage − borrowRate·borrowExposure
 * where borrowExposure counts BOTH HOLLAR legs (loop + the vault's Main leg) per
 * unit of loop equity — HOLLAR is borrowed twice, so (leverage − 1) alone
 * understates the cost. PRIME yield = the money market's total PRIME supply APY
 * (Aave base + Kamino external + farms), the same number the borrow page shows.
 * Returns null — never 0 or negative — when an input is missing or the carry
 * isn't positive, so the UI can simply hide it.
 */
export function usePropellerApy(
  override?: PropellerVaultConfig,
): number | null {
  const { data: subLoop } = useSubLoopStats(override)
  const { data: apyData } = useBorrowAssetsApy([PRIME_ASSET_ID])
  const primeSupplyApy = apyData?.find(
    (a) => a.assetId === PRIME_ASSET_ID,
  )?.totalSupplyApy

  const leverage = subLoop?.leverage ?? null
  const borrowExposure = subLoop?.borrowExposure ?? null
  const borrowRate = subLoop?.borrowRate ?? null
  if (
    leverage === null ||
    borrowExposure === null ||
    borrowRate === null ||
    primeSupplyApy === undefined
  ) {
    return null
  }
  const primeYield = primeSupplyApy / 100 // percent → fraction
  const apr = primeYield * leverage - borrowRate * borrowExposure
  return apr > 0 ? apr : null
}

export function useUserBalances(evmAddress: Hex | undefined) {
  const { evm } = useRpcProvider()
  const { vaultAddress, assetAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-balances", vaultAddress, evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { eth: 0, shares: 0 }

      const ethToken = getContract({
        address: assetAddress,
        abi: ERC20_ABI,
        client: evm,
      })
      const vault = getContract({
        address: vaultAddress,
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
  const { vaultAddress, assetAddress } = useActivePropellerVault()
  return useQuery({
    queryKey: ["propeller-vault-allowance", vaultAddress, evmAddress],
    enabled: !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return 0
      const ethToken = getContract({
        address: assetAddress,
        abi: ERC20_ABI,
        client: evm,
      })
      const allowance = await ethToken.read.allowance([
        evmAddress,
        vaultAddress,
      ])
      return Number(formatUnits(allowance, 18))
    },
    refetchInterval: 15_000,
  })
}
