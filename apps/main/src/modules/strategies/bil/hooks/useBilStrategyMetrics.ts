import { useBilReserveConfig } from "@/modules/strategies/bil/hooks/useBilPoolPosition"
import { useVaultStats } from "@/modules/strategies/bil/hooks/useVaultReads"

const NAX_LTV_PCT_DEFAULT = 80
const LIQUIDATION_LTV_PCT_DEFAULT = 90

export type BilStrategyMetrics = {
  tvl: number
  maxLtvPct: number
  liquidationLtvPct: number
  borrowApyPct: number
  maxLeverage: number
  maxNetApyPct: number
}

export function useBilStrategyMetrics() {
  const { data: vaultStats, isLoading: isVaultStatsLoading } = useVaultStats()
  const { data: reserveConfig, isLoading: isReserveConfigLoading } =
    useBilReserveConfig()

  const tvl = vaultStats.totalAssets * vaultStats.exchangeRate
  const maxLtvPct = reserveConfig?.maxLtvPct ?? NAX_LTV_PCT_DEFAULT
  const liquidationLtvPct =
    reserveConfig?.liquidationThresholdPct ?? LIQUIDATION_LTV_PCT_DEFAULT

  // "Max Net APY" = the leveraged yield an idealized user achieves at max LTV.
  //   L = 1 / (1 − LTV)
  //   netApy = L × vault_apy − (L − 1) × borrow_apy
  // vaultStats.apr is named historically but actually carries vault APY in %
  // (see useVaultReads: getAPYWad / 1e16). Falls back to the raw vault yield
  // until the borrow rate query lands.
  const vaultApyPct = vaultStats.apr
  const borrowApyPct = reserveConfig?.borrowApyPct || 10
  // Leverage requires borrowing HOLLAR. It's disabled at launch (staged
  // rollout), so until governance enables it the max achievable is the plain
  // (unleveraged) vault yield — otherwise we'd advertise a leveraged Net APY
  // no one can actually reach. Default false while the config query is loading.
  const borrowingEnabled = reserveConfig?.borrowingEnabled ?? false
  const maxLeverage =
    borrowingEnabled && maxLtvPct < 100 ? 100 / (100 - maxLtvPct) : 1
  const maxNetApyPct =
    maxLeverage * vaultApyPct - (maxLeverage - 1) * borrowApyPct

  const metrics: BilStrategyMetrics = {
    tvl,
    maxLtvPct,
    liquidationLtvPct,
    borrowApyPct,
    maxLeverage,
    maxNetApyPct,
  }

  return {
    data: metrics,
    isLoading: isVaultStatsLoading || isReserveConfigLoading,
  }
}
