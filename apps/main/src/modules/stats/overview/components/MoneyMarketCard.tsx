import { useTranslation } from "react-i18next"

import iconMoneyMarket from "@/assets/icons/icon-money-market.png"
import { useMoneyMarketStats } from "@/modules/stats/hooks/useMoneyMarketStats"
import { ProductCard } from "@/modules/stats/overview/components/ProductCard"

export const MoneyMarketCard = () => {
  const { t } = useTranslation(["common", "stats"])
  const { stats, isLoading } = useMoneyMarketStats()

  return (
    <ProductCard
      title={t("stats:overview.products.moneyMarket.title")}
      desc={t("stats:overview.products.moneyMarket.desc")}
      icon={iconMoneyMarket}
      span={3}
      isLoading={isLoading}
      metrics={[
        {
          label: t("stats:overview.products.moneyMarket.marketSize"),
          value: isLoading
            ? "-"
            : t("currency.compact", { value: stats.borrowTvl }),
        },
        {
          label: t("stats:overview.products.moneyMarket.totalBorrows"),
          value: isLoading
            ? "-"
            : t("currency.compact", { value: stats.totalBorrows }),
        },
        {
          label: t("stats:overview.products.moneyMarket.utilization"),
          value: isLoading
            ? "-"
            : t("percent", { value: stats.borrowUtilization }),
        },
      ]}
    />
  )
}
