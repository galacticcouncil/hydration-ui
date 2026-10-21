import { PRIME_ASSET_ID } from "@galacticcouncil/utils"
import { useQueries, useQuery } from "@tanstack/react-query"

import { useBorrowAssetsApy } from "@/api/borrow"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
  vaultCollateral,
} from "@/modules/strategies/propeller/config/vaults"
import {
  useBaseRates,
  useVaultDisplayAsset,
} from "@/modules/strategies/propeller/hooks/useCollateralEquivalent"
import {
  subLoopQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { computeVaultApr } from "@/modules/strategies/propeller/utils/accounting"
import {
  borrowDeployedFraction,
  targetLoopLeverage,
  toApy,
} from "@/modules/strategies/propeller/utils/yieldRate"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

const VAULT_ASSET_IDS = PROPELLER_VAULTS.map((vault) => vault.assetId)

export const remainingCapacity = (tvl: number, cap: number) => {
  const remaining = Math.max(cap - tvl, 0)
  return { remaining, remainingPct: cap > 0 ? (remaining / cap) * 100 : 0 }
}

export type VaultDepositState = "open" | "paused" | "full" | "unavailable"

export const vaultDepositState = (
  stats: PropellerVaultStats | undefined,
): VaultDepositState => {
  if (!stats) return "unavailable"
  if (stats.paused || stats.depositsPaused || stats.deficitStop) return "paused"
  // an unreadable stop fails closed like the deposit form
  if (stats.deficitStop === null) return "unavailable"
  if (stats.remaining <= 0) return "full"
  return "open"
}

export type PropellerVaultStats = {
  tvl: number
  cap: number
  remaining: number
  remainingPct: number
  paused: boolean
  depositsPaused: boolean
  deficitStop: boolean | null
  exchangeRate: number
  maxLtv: number | null
  mainCollUsd: number | null
  mainDebtUsd: number | null
  pendingDeployment: string | null
}

export type PropellerVaultMarket = {
  vault: PropellerVaultConfig
  /** collateral asset, with the vault's symbol override (GIGAETH) */
  asset: TAsset
  /** what the user sees: the base asset (ETH) when the collateral tracks one */
  displayAsset: TAsset
  /** collateral -> display-asset spot rate; null while loading — hold amounts back */
  baseRate: string | null
  stats: PropellerVaultStats | undefined
  /** steady-state estimate at target leverage, compounded — the advertised rate */
  apy: number | null
  /** what a holder accrues right now: apy x deployed fraction, 0 while underfunded */
  runRateApy: number | null
  /** allocation gate closed — nothing accrues regardless of the estimate */
  accrualPaused: boolean
  price: number
  tvlUsd: number
}

export const usePropellerVaults = () => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
  const { getRate, isLoading: isRateLoading } = useBaseRates()
  const getDisplayAsset = useVaultDisplayAsset()
  const { getAssetPrice, isLoading: isPriceLoading } =
    useAssetsPrice(VAULT_ASSET_IDS)

  const statsQueries = useQueries({
    queries: PROPELLER_VAULTS.map((vault) =>
      vaultStatsQuery(rpc, vault, getAssetWithFallback(vault.assetId).decimals),
    ),
  })
  const { data: subLoop, isLoading: isSubLoopLoading } = useQuery(
    subLoopQuery(rpc),
  )
  const { data: apyData, isLoading: isApyLoading } = useBorrowAssetsApy([
    PRIME_ASSET_ID,
  ])
  const primeSupplyApy = apyData?.find(
    (a) => a.assetId === PRIME_ASSET_ID,
  )?.totalSupplyApy

  const vaults = PROPELLER_VAULTS.map<PropellerVaultMarket>((vault, i) => {
    const data = statsQueries[i]?.data
    const price = Number(getAssetPrice(vault.assetId).price || 0)
    const stats = data && {
      tvl: data.totalAssets,
      cap: data.tvlCap,
      ...remainingCapacity(data.totalAssets, data.tvlCap),
      paused: data.paused,
      depositsPaused: data.depositsPaused,
      deficitStop: data.deficitStop,
      exchangeRate: data.exchangeRate,
      maxLtv: data.maxLtv,
      mainCollUsd: data.mainCollUsd,
      mainDebtUsd: data.mainDebtUsd,
      pendingDeployment: data.pendingDeployment,
    }

    // Advertised rate: target leverage (deterministic steady state), compounded.
    // Live loop gearing dips after every large deposit and would make the
    // estimate a function of whoever deposited last.
    const apy = toApy(
      computeVaultApr({
        maxLtv: stats?.maxLtv,
        leverage:
          targetLoopLeverage(subLoop?.targetHf, subLoop?.primeLtBps) ??
          subLoop?.leverage,
        borrowRate: subLoop?.borrowRate,
        primeSupplyApy,
        protocolFeeBps: data?.protocolFeeBps,
        mainDiscountBps: data?.mainDiscountBps,
      }),
    )
    // deficitStop is the juicer generation's deficit signal (keeper-maintained;
    // also blocks deposits). The prior generation's isUnderfunded() view does
    // not exist on these vaults.
    const accrualPaused = stats?.deficitStop === true
    const deployed = borrowDeployedFraction({
      mainCollUsd: stats?.mainCollUsd,
      mainDebtUsd: stats?.mainDebtUsd,
      maxLtv: stats?.maxLtv,
    })
    return {
      vault,
      asset: vaultCollateral(vault, getAssetWithFallback(vault.assetId)),
      displayAsset: getDisplayAsset(vault),
      baseRate: getRate(vault),
      stats,
      apy,
      runRateApy:
        apy === null ? null : accrualPaused ? 0 : apy * (deployed ?? 1),
      accrualPaused,
      price,
      tvlUsd: (stats?.tvl ?? 0) * price,
    }
  })

  const apys = vaults.flatMap(({ apy }) => (apy === null ? [] : [apy]))

  return {
    vaults,
    subLoop,
    upToApy: apys.length ? Math.max(...apys) : null,
    totalTvlUsd: vaults.reduce((sum, { tvlUsd }) => sum + tvlUsd, 0),
    isLoading:
      statsQueries.some((q) => q.isLoading) ||
      isSubLoopLoading ||
      isApyLoading ||
      isPriceLoading ||
      isRateLoading,
  }
}
