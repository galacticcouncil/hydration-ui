import { ValueStatsBottomValue } from "@galacticcouncil/ui/components"
import { css, styled } from "@galacticcouncil/ui/utils"
import { createFileRoute } from "@tanstack/react-router"

import { formatUSD } from "@/api/stats"
import { MultiMetricChart } from "@/modules/stats/components/MultiMetricChart"
import { ProductCards } from "@/modules/stats/components/ProductCards"
import { StatsHeader } from "@/modules/stats/components/StatsHeader"
import { useAggregatedPlatformStats } from "@/modules/stats/hooks/useAggregatedPlatformStats"

const SPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.space.xl};
  padding-bottom: ${({ theme }) => theme.space.xl};
`

const SSection = styled.section<{ hasHeader?: boolean }>(
  ({ theme, hasHeader }) => css`
    background: ${theme.surfaces.containers.high.primary};
    border: 1px solid ${theme.details.borders};
    border-radius: 16px;
    padding: ${theme.space.xl};

    @media (max-width: 576px) {
      padding: ${hasHeader ? 0 : theme.space.l} ${theme.space.l}
        ${theme.space.l};
    }
  `,
)

const SPriceChange = styled(ValueStatsBottomValue)<{ $isNegative: boolean }>(
  ({ theme, $isNegative }) => css`
    color: ${$isNegative
      ? theme.accents.danger.emphasis
      : theme.accents.success.emphasis};
  `,
)

const REVENUE_LOOKBACK_DAYS = 7

const formatRevenueTooltipDate = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date)

const getRevenueAnnualizedTooltip = () => {
  const endDate = new Date()
  endDate.setDate(endDate.getDate() - 1)

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - REVENUE_LOOKBACK_DAYS)

  return `Protocol revenue from ${formatRevenueTooltipDate(startDate)} through ${formatRevenueTooltipDate(endDate)}, annualized x365.`
}

function PlatformOverview() {
  const { stats: aggregatedStats, isLoading } = useAggregatedPlatformStats()
  const hdxChangeLabel = `${aggregatedStats.hdxChange > 0 ? "+" : ""}${aggregatedStats.hdxChange}%`
  const revenueAnnualized = aggregatedStats.protocolRevenue * 365
  const revenueAnnualizedTooltip = getRevenueAnnualizedTooltip()

  const stats = [
    {
      label: "Total TVL",
      value: formatUSD(aggregatedStats.totalTvl),
      isLoading,
    },
    {
      label: "24h Volume",
      value: formatUSD(aggregatedStats.totalVolume),
      isLoading,
    },
    {
      label: "Capital Efficiency",
      value: `${aggregatedStats.capitalEfficiency.toFixed(2)}%`,
      isLoading,
    },
    {
      label: "Protocol Annualised",
      value: formatUSD(revenueAnnualized),
      tooltip: revenueAnnualizedTooltip,
      isLoading,
    },
    {
      label: "HDX Price",
      value: `$${aggregatedStats.hdxPrice.toFixed(4)}`,
      customBottomLabel: (
        <SPriceChange $isNegative={aggregatedStats.hdxChange < 0}>
          {hdxChangeLabel}
        </SPriceChange>
      ),
      isLoading,
    },
    {
      label: "Hollar Supply",
      value: formatUSD(aggregatedStats.hollarSupply),
      isLoading,
    },
  ]

  return (
    <SPageContainer>
      <StatsHeader stats={stats} />

      <SSection>
        <MultiMetricChart />
      </SSection>

      <ProductCards />
    </SPageContainer>
  )
}

export const Route = createFileRoute("/stats/overview")({
  component: PlatformOverview,
})
