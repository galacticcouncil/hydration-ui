import { PRIME_ASSET_ID } from "@galacticcouncil/utils"
import { useQueries, useQuery } from "@tanstack/react-query"

import { useBorrowAssetsApy } from "@/api/borrow"
import {
  PROPELLER_VAULTS,
  type PropellerVaultConfig,
} from "@/modules/strategies/propeller/config/vaults"
import {
  computeVaultApy,
  subLoopQuery,
  vaultStatsQuery,
} from "@/modules/strategies/propeller/hooks/useVaultReads"
import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAssetsPrice } from "@/states/displayAsset"

const VAULT_ASSET_IDS = PROPELLER_VAULTS.map((vault) => vault.assetId)

export const remainingCapacity = (tvl: number, cap: number) => {
  const remaining = Math.max(cap - tvl, 0)
  return { remaining, remainingPct: cap > 0 ? (remaining / cap) * 100 : 0 }
}

export type VaultDepositState = "open" | "paused" | "full"

export const vaultDepositState = (
  stats: PropellerVaultStats | undefined,
): VaultDepositState => {
  if (!stats) return "open"
  if (stats.paused || stats.depositsPaused) return "paused"
  if (stats.cap > 0 && stats.remaining <= 0) return "full"
  return "open"
}

export type PropellerVaultStats = {
  tvl: number
  cap: number
  remaining: number
  remainingPct: number
  paused: boolean
  depositsPaused: boolean
  exchangeRate: number
  maxLtv: number | null
}

export type PropellerVaultMarket = {
  vault: PropellerVaultConfig
  asset: TAsset
  stats: PropellerVaultStats | undefined
  apy: number | null
  price: number
  tvlUsd: number
}

export const usePropellerVaults = () => {
  const rpc = useRpcProvider()
  const { getAssetWithFallback } = useAssets()
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
      exchangeRate: data.exchangeRate,
      maxLtv: data.maxLtv,
    }

    return {
      vault,
      asset: getAssetWithFallback(vault.assetId),
      stats,
      apy: computeVaultApy({
        maxLtv: stats?.maxLtv,
        leverage: subLoop?.leverage,
        borrowRate: subLoop?.borrowRate,
        primeSupplyApy,
      }),
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
      isPriceLoading,
  }
}
