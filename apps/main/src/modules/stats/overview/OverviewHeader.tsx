import { platformTotalQuery } from "@galacticcouncil/indexer/squid"
import {
  Separator,
  Stack,
  ValueStats,
  ValueStatsBottomValue,
} from "@galacticcouncil/ui/components"
import { getSpacingValue, getToken } from "@galacticcouncil/ui/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import { useFeesStats } from "@/modules/stats/hooks/useFeesStats"
import { useHollarStats } from "@/modules/stats/hooks/useHollarStats"
import { useMoneyMarketStats } from "@/modules/stats/hooks/useMoneyMarketStats"
import { useNativePriceChange } from "@/modules/stats/hooks/useNativePriceChange"

const REVENUE_LOOKBACK_DAYS = 7

export const OverviewHeader = () => {
  const squidClient = useSquidClient()
  const { t } = useTranslation(["common", "stats"])
  const { data: priceChangeData, isLoading: isPriceChangeLoading } =
    useNativePriceChange()

  const { stats: feesStats, isLoading: isFeesLoading } = useFeesStats()
  const { stats: hollarStats, isLoading: isHollarLoading } = useHollarStats()
  const { data: platformTotal, isLoading: isPlatformTotalLoading } = useQuery(
    platformTotalQuery(squidClient),
  )
  const { stats: moneyMarketStats, isLoading: isMoneyMarketLoading } =
    useMoneyMarketStats()

  const endDate = new Date()
  endDate.setDate(endDate.getDate() - 1)

  const startDate = new Date(endDate)
  startDate.setDate(startDate.getDate() - REVENUE_LOOKBACK_DAYS)

  const { borrowTvl } = moneyMarketStats

  const tradingTvl = platformTotal
    ? Big(platformTotal.omnipoolTvlNorm ?? 0)
        .plus(platformTotal.stablepoolsTvlNorm ?? 0)
        .plus(platformTotal.xykpoolsTvlNorm ?? 0)
        .toString()
    : undefined

  const totalTvl = tradingTvl
    ? Big(tradingTvl).plus(borrowTvl).toString()
    : undefined

  const capitalEfficiency = totalTvl
    ? Big(totalTvl).div(borrowTvl).mul(100).toString()
    : undefined

  const stats = [
    {
      label: t("stats:overview.header.totalTvl"),
      value: t("currency.compact", { value: totalTvl }),
      isLoading: isPlatformTotalLoading || isMoneyMarketLoading,
    },
    {
      label: t("stats:overview.header.volume"),
      value: t("currency.compact", { value: platformTotal?.totalVolNorm }),
      isLoading: isPlatformTotalLoading || isMoneyMarketLoading,
    },
    {
      label: t("stats:overview.header.capitalEfficiency"),
      value: t("percent", {
        value: capitalEfficiency ?? "-",
      }),
      isLoading: isPlatformTotalLoading || isMoneyMarketLoading,
    },
    {
      label: t("stats:overview.header.protocolAnnualised"),
      value: t("currency.compact", {
        value: feesStats.protocolRevenue,
      }),
      isLoading: isFeesLoading,
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
      value: t("currency.compact", { value: hollarStats.hollarSupply }),
      isLoading: isHollarLoading,
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
