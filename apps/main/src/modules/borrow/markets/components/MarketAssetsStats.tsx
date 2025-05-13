import { useAggregatedMarketStats } from "@galacticcouncil/money-market/hooks"
import { Separator, Stack, ValueStats } from "@galacticcouncil/ui/components"
import { useTranslation } from "react-i18next"

export const MarketAssetsStats = () => {
  const { t } = useTranslation(["common", "borrow"])

  const { data } = useAggregatedMarketStats()

  return (
    <Stack direction={["column", "row"]} justify="flex-start" gap={[0, 40]}>
      <ValueStats
        label={t("borrow:market.stats.totalSize")}
        value={t("common:currency", { value: data.totalLiquidity })}
        size="large"
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("borrow:market.stats.totalAvailable")}
        value={t("common:currency", { value: data.totalAvailable })}
        size="large"
      />
      <Separator orientation="vertical" sx={{ my: 10 }} />
      <ValueStats
        label={t("borrow:market.stats.totalBorrows")}
        value={t("common:currency", { value: data.totalDebt })}
        size="large"
      />
    </Stack>
  )
}
