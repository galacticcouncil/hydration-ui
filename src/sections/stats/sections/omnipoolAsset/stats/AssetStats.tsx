import { useTranslation } from "react-i18next"
import { AssetStatsCard } from "./AssetStatsCard"
import BN from "bignumber.js"

export const AssetStats = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: { pol: BN; vlm: BN; cap: BN; share: BN }
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: ["column", "row"], gap: 20 }}>
      <div sx={{ flex: "column", gap: 20, justify: "space-between" }}>
        <AssetStatsCard
          title={t("stats.omnipool.stats.card.vlm")}
          value={t("value.usd", { amount: data?.vlm })}
          loading={loading}
        />
        <AssetStatsCard
          title={t("stats.omnipool.stats.card.pol")}
          value={t("value.usd", { amount: data?.pol })}
          loading={loading}
        />
        <AssetStatsCard
          title={t("stats.omnipool.stats.card.maxCapacity")}
          value={t("value.percentage", { value: data?.cap })}
          loading={loading}
        />
        <AssetStatsCard
          title={t("stats.omnipool.stats.card.percentage")}
          value={t("value.percentage", { value: data?.share })}
          loading={loading}
        />
      </div>
      <div></div>
    </div>
  )
}
