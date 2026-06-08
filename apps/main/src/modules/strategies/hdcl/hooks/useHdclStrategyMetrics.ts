import { STRATEGY } from "@/modules/strategies/hdcl/constants"
import { useHdclReserveConfig } from "@/modules/strategies/hdcl/hooks/useHdclPoolPosition"
import { useVaultStats } from "@/modules/strategies/hdcl/hooks/useVaultReads"

export type HdclStrategyMetrics = {
  tvl: number
  maxLtvPct: number
  liquidationLtvPct: number
  borrowApyPct: number | null
  maxLeverage: number
  maxNetApyPct: number | null
}

export function useHdclStrategyMetrics() {
  const { data: vaultStats, isLoading: isVaultStatsLoading } = useVaultStats()
  const { data: reserveConfig, isLoading: isReserveConfigLoading } =
    useHdclReserveConfig()

  const tvl = vaultStats.totalAssets * vaultStats.exchangeRate
  const maxLtvPct = reserveConfig?.maxLtvPct ?? STRATEGY.maxLtvPct
  const liquidationLtvPct =
    reserveConfig?.liquidationThresholdPct ?? STRATEGY.liquidationLtvPct

  // "Max Net APY" = the leveraged yield an idealized user achieves at max LTV.
  //   L = 1 / (1 − LTV)
  //   netApy = L × vault_apy − (L − 1) × borrow_apy
  // vaultStats.apr is named historically but actually carries vault APY in %
  // (see useVaultReads: getAPYWad / 1e16). Falls back to the raw vault yield
  // until the borrow rate query lands.
  const vaultApyPct = vaultStats.apr
  const borrowApyPct = reserveConfig?.borrowApyPct || null
  const maxLeverage = maxLtvPct < 100 ? 100 / (100 - maxLtvPct) : 1
  const maxNetApyPct = borrowApyPct
    ? maxLeverage * vaultApyPct - (maxLeverage - 1) * borrowApyPct
    : null

  const metrics: HdclStrategyMetrics = {
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
