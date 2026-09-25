import { getAddressFromAssetId } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"
import { isNullish } from "remeda"
import { erc20Abi, formatUnits, getContract, type Hex } from "viem"

import {
  POOL_ABI,
  SUBLOOP_ABI,
  VAULT_ABI,
} from "@/modules/strategies/propeller/config/abi"
import { type PropellerVaultConfig } from "@/modules/strategies/propeller/config/vaults"
import {
  HOLLAR_ADDRESS,
  POOL_ADDRESS,
  SUBLOOP_ADDRESS,
} from "@/modules/strategies/propeller/constants"
import { propellerQueryKeys } from "@/modules/strategies/propeller/utils/queryKeys"
import { TProviderContext } from "@/providers/rpcProvider"

// No on-chain APR view; these are first-paint placeholders until chain reads load.
const FALLBACK_APR = 0
const FALLBACK_MIN_REDEEM = 0

/** Runs a read and returns fallback when it reverts, so one failed read does not blank the page. */
const safeRead = async <T, F = null>(
  label: string,
  read: () => Promise<T>,
  fallback: F = null as F,
): Promise<T | F> => {
  try {
    return await read()
  } catch (err) {
    if (import.meta.env.DEV) {
      console.warn(`[propeller-vault] ${label} reverted`, err)
    }
    return fallback
  }
}

export const vaultStatsQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  // CollateralVault has no decimals() override; shares use the collateral scale.
  decimals: number,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultStats(vault.vaultAddress),
    enabled: isReady,
    queryFn: async () => {
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })
      const pool = getContract({
        address: POOL_ADDRESS,
        abi: POOL_ABI,
        client: evm,
      })
      const [
        totalAssets,
        totalSupply,
        exchangeRateWad,
        tvlCap,
        paused,
        depositsPaused,
        queueHead,
        queueTail,
        collateralConfig,
      ] = await Promise.all([
        contract.read.totalAssets(),
        contract.read.totalSupply(),
        contract.read.exchangeRate(),
        contract.read.tvlCap(),
        contract.read.paused(),
        contract.read.depositsPaused(),
        contract.read.queueHead(),
        contract.read.queueTail(),
        safeRead("Pool.getConfiguration(collateral)", () =>
          pool.read.getConfiguration([
            getAddressFromAssetId(vault.assetId) as Hex,
          ]),
        ),
      ])

      const queueLength = queueTail > queueHead ? queueTail - queueHead : 0n

      // maxLtv comes from the collateral's reserve config bitmap. Do not derive
      // LTV from getUserAccountData(vault): synthetic collateral inflates
      // totalCollateralBase.
      const ltvBps =
        collateralConfig === null ? 0 : Number(collateralConfig & 0xffffn)

      return {
        totalAssets: Number(formatUnits(totalAssets, decimals)),
        totalSupply: Number(formatUnits(totalSupply, decimals)),
        // exchangeRate is WAD-scaled (1e18), not collateral decimals.
        exchangeRate: Number(formatUnits(exchangeRateWad, 18)),
        queueLength: Number(queueLength),
        tvlCap: Number(formatUnits(tvlCap, decimals)),
        paused,
        depositsPaused,
        maxLtv: ltvBps > 0 ? ltvBps / 1e4 : null,
        minRedeem: FALLBACK_MIN_REDEEM,
        apr: FALLBACK_APR,
      }
    },
    refetchInterval: 30_000,
  })

/** SubLoop reads; each call fails independently so a partial deploy does not blank the page. */
export const subLoopQuery = ({ isReady, evm }: TProviderContext) =>
  queryOptions({
    queryKey: propellerQueryKeys.subLoop(),
    enabled: isReady,
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
      const [healthFactor, negativeCarryBps, targetHf, account, hollarRes] =
        await Promise.all([
          safeRead("SubLoop.healthFactor", () => subLoop.read.healthFactor()),
          safeRead("SubLoop.negativeCarryBps", () =>
            subLoop.read.negativeCarryBps(),
          ),
          safeRead("SubLoop.targetHf", () => subLoop.read.targetHf()),
          safeRead("Pool.getUserAccountData(SubLoop)", () =>
            pool.read.getUserAccountData([SUBLOOP_ADDRESS]),
          ),
          safeRead("Pool.getReserveData(HOLLAR)", () =>
            pool.read.getReserveData([HOLLAR_ADDRESS]),
          ),
        ])

      // loopLeverage is SubLoop-wide.
      let loopLeverage: number | null = null
      let borrowRate: number | null = null
      if (account) {
        const loopColl = account[0]
        const loopDebt = account[1]
        const loopEquity = loopColl - loopDebt // totalCollateralBase − totalDebtBase
        if (loopEquity > 0n)
          loopLeverage = Number(loopColl) / Number(loopEquity)
      }
      if (hollarRes) {
        borrowRate = Number(hollarRes.currentVariableBorrowRate) / 1e27
      }

      return {
        leverage: loopLeverage,
        healthFactor:
          healthFactor === null ? null : Number(formatUnits(healthFactor, 18)),
        targetHf: targetHf === null ? null : Number(formatUnits(targetHf, 18)),
        borrowRate,
        negativeCarry:
          negativeCarryBps === null ? null : Number(negativeCarryBps) / 1e4,
      }
    },
    refetchInterval: 30_000,
  })

/**
 * Net deposit APY = maxLtv * loopLeverage * (primeYield - borrowRate), in
 * percent for common:percent (it divides by 100). Returns null when inputs are
 * missing or carry is not positive.
 */
export const computeVaultApy = ({
  maxLtv,
  leverage,
  borrowRate,
  primeSupplyApy,
}: {
  maxLtv: number | null | undefined
  leverage: number | null | undefined
  borrowRate: number | null | undefined
  primeSupplyApy: number | null | undefined
}): number | null => {
  if (
    isNullish(maxLtv) ||
    isNullish(leverage) ||
    isNullish(borrowRate) ||
    isNullish(primeSupplyApy)
  ) {
    return null
  }
  const primeYield = primeSupplyApy / 100
  const apr = maxLtv * leverage * (primeYield - borrowRate)
  return apr > 0 ? apr * 100 : null
}

/**
 * SubLoop equity for this vault. equity gates withdraw; pendingUnwind signals
 * a stalled unwind that may pay out short.
 */
export const vaultLoopPositionQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultLoopPosition(vault.vaultAddress),
    enabled: isReady,
    queryFn: async () => {
      const subLoop = getContract({
        address: SUBLOOP_ADDRESS,
        abi: SUBLOOP_ABI,
        client: evm,
      })
      const [equity, pendingUnwind] = await Promise.all([
        safeRead("SubLoop.equityOf", () =>
          subLoop.read.equityOf([vault.vaultAddress]),
        ),
        safeRead("SubLoop.pendingUnwindOf", () =>
          subLoop.read.pendingUnwindOf([vault.vaultAddress]),
        ),
      ])
      return { equity, pendingUnwind }
    },
    refetchInterval: 30_000,
  })

export const vaultBalancesQuery = (
  { isReady, evm }: TProviderContext,
  vault: PropellerVaultConfig,
  decimals: number,
  evmAddress: Hex | undefined,
) =>
  queryOptions({
    queryKey: propellerQueryKeys.vaultBalances(vault.vaultAddress, evmAddress),
    enabled: isReady && !!evmAddress,
    queryFn: async () => {
      if (!evmAddress) return { eth: 0, shares: 0 }

      const collateralToken = getContract({
        address: getAddressFromAssetId(vault.assetId) as Hex,
        abi: erc20Abi,
        client: evm,
      })
      const contract = getContract({
        address: vault.vaultAddress,
        abi: VAULT_ABI,
        client: evm,
      })

      const [collateralBal, shareBal] = await Promise.all([
        safeRead(
          "collateral.balanceOf",
          () => collateralToken.read.balanceOf([evmAddress]),
          0n,
        ),
        safeRead(
          "vault shares.balanceOf",
          () => contract.read.balanceOf([evmAddress]),
          0n,
        ),
      ])

      return {
        eth: Number(formatUnits(collateralBal, decimals)),
        shares: Number(formatUnits(shareBal, decimals)),
      }
    },
    refetchInterval: 15_000,
  })
