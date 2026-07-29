import {
  AggregationTimeRange,
  platformTotalQuery,
  platformTotalVolumesQuery,
} from "@galacticcouncil/indexer/squid"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { useSquidClient } from "@/api/provider"
import iconTrading from "@/assets/icons/icon-trading.png"
import { ProductCard } from "@/modules/stats/overview/components/ProductCard"

export const TradingCard = () => {
  const { t } = useTranslation(["common", "stats"])
  const squidClient = useSquidClient()
  const { data: volumes7d, isLoading: isVolumes7dLoading } = useQuery(
    platformTotalVolumesQuery(squidClient, AggregationTimeRange["7D"]),
  )
  const { data: platformTotal, isLoading: isPlatformTotalLoading } = useQuery(
    platformTotalQuery(squidClient),
  )

  const tradingVolume7d = Number(volumes7d?.totalVolNorm ?? 0) || 0

  const tradingTvl = platformTotal
    ? Big(platformTotal.omnipoolTvlNorm ?? 0)
        .plus(platformTotal.stablepoolsTvlNorm ?? 0)
        .plus(platformTotal.xykpoolsTvlNorm ?? 0)
        .toString()
    : undefined

  return (
    <ProductCard
      title={t("stats:overview.products.trading.title")}
      desc={t("stats:overview.products.trading.desc")}
      icon={iconTrading}
      span={2}
      isLoading={isPlatformTotalLoading || isVolumes7dLoading}
      metrics={[
        {
          label: t("stats:overview.products.trading.tvl"),
          value: isPlatformTotalLoading
            ? "-"
            : t("currency.compact", { value: tradingTvl }),
        },
        {
          label: t("stats:overview.products.trading.volume7d"),
          value: isVolumes7dLoading
            ? "-"
            : t("currency.compact", { value: tradingVolume7d }),
        },
      ]}
    />
  )
}
