import {
  Separator,
  Stack,
  ValueStats,
  ValueStatsBottomValue,
} from "@galacticcouncil/ui/components"
import { getSpacingValue, getToken } from "@galacticcouncil/ui/utils"
import { useTranslation } from "react-i18next"

import { useAggregatedPlatformStats } from "@/modules/stats/hooks/useAggregatedPlatformStats"
import { useNativePriceChange } from "@/modules/stats/hooks/useNativePriceChange"

const REVENUE_LOOKBACK_DAYS = 7

export const OverviewHeader = () => {
  const { t } = useTranslation(["common", "stats"])
  const { data: priceChangeData, isLoading: isPriceChangeLoading } =
    useNativePriceChange()
  const { stats: aggregatedStats, isLoading: isStatsLoading } =
    useAggregatedPlatformStats()

  const endDate = new Date()
  endDate.setDate(endDate.getDate() - 1)

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - REVENUE_LOOKBACK_DAYS)

  const tooltip = t("stats:overview.header.protocolAnnualised.tooltip", {
    from: startDate,
    to: endDate,
  })

  const stats = [
    {
      label: t("stats:overview.header.totalTvl"),
      value: t("currency.compact", { value: aggregatedStats.totalTvl }),
      isLoading: isStatsLoading,
    },
    {
      label: t("stats:overview.header.volume"),
      value: t("currency.compact", { value: aggregatedStats.totalVolume }),
      isLoading: isStatsLoading,
    },
    {
      label: t("stats:overview.header.capitalEfficiency"),
      value: t("percent", {
        value: aggregatedStats.capitalEfficiency,
      }),
      isLoading: isStatsLoading,
    },
    {
      label: t("stats:overview.header.protocolAnnualised"),
      value: t("currency.compact", {
        value: aggregatedStats.protocolRevenue * 365,
      }),
      tooltip,
      isLoading: isStatsLoading,
    },
    {
      label: t("stats:overview.header.hdxPrice"),
      value: t("currency", {
        value: priceChangeData?.currentHdxPrice,
        maximumFractionDigits: 4,
      }),
      customBottomLabel: (
        <ValueStatsBottomValue
          sx={{
            color:
              (priceChangeData?.change ?? 0) < 0
                ? getToken("accents.danger.emphasis")
                : getToken("accents.success.emphasis"),
          }}
        >
          {t("stats:overview.header.hdxPrice.change", {
            value: priceChangeData?.change ?? "",
          })}
        </ValueStatsBottomValue>
      ),
      isLoading: isPriceChangeLoading,
    },
    {
      label: t("stats:overview.header.hollarSupply"),
      value: t("currency.compact", { value: aggregatedStats.hollarSupply }),
      isLoading: isStatsLoading,
    },
  ]

  return (
    <Stack
      direction="row"
      gap={getSpacingValue("primary")}
      sx={{ overflowX: "auto" }}
      separator={<Separator orientation="vertical" my="m" />}
      separated
    >
      {stats.map((stat) => (
        <ValueStats key={stat.label} {...stat} wrap />
      ))}
    </Stack>
  )
}
