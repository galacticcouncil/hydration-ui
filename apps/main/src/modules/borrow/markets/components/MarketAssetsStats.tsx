import { useAggregatedMarketStats } from "@galacticcouncil/money-market/hooks"
import { Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const MarketAssetsStats = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { data } = useAggregatedMarketStats()

  return (
    <Stack
      direction={["column", null, "row"]}
      justify="flex-start"
      gap={[10, null, 40, 60]}
      separated
    >
      <ValueStats
        label={t("borrow:market.stats.totalSize")}
        value={t("common:currency", { value: data.totalLiquidity })}
        size="large"
      />
      <ValueStats
        label={t("borrow:market.stats.totalAvailable")}
        value={t("common:currency", { value: data.totalAvailable })}
        size="large"
      />
      <ValueStats
        label={t("borrow:market.stats.totalBorrows")}
        value={t("common:currency", { value: data.totalDebt })}
        size="large"
      />
    </Stack>
  )
}
