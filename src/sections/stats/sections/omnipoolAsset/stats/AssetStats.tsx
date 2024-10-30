import { useTranslation } from "react-i18next"
import { AssetStatsCard } from "./AssetStatsCard"
import BN from "bignumber.js"
import { TFarmAprData } from "api/farms"
import { useAssets } from "providers/assets"

const APYStatsCard = ({
  loading,
  assetId,
  totalFee,
  isFarms,
}: {
  loading?: boolean
  assetId: string
  totalFee: BN
  isFarms: boolean
}) => {
  const { t } = useTranslation()
  const { native } = useAssets()

  return (
    <AssetStatsCard
      title={t(
        isFarms
          ? "stats.omnipool.stats.card.apyWithFarm"
          : "stats.omnipool.stats.card.apy",
      )}
      value={
        assetId === native.id
          ? "--"
          : t("value.percentage", { value: totalFee })
      }
      loading={loading}
      tooltip={t("stats.overview.table.assets.header.apy.desc")}
    />
  )
}

export const AssetStats = ({
  loading,
  isLoadingFee,
  data,
}: {
  loading?: boolean
  isLoadingFee?: boolean
  data?: {
    pol: BN
    vlm: BN
    cap: BN
    share: BN
    assetId: string
    fee: BN
    totalFee: BN
    farms: TFarmAprData[]
  }
}) => {
  const { t } = useTranslation()

  return (
    <div sx={{ flex: ["column", "row"], gap: 20 }}>
      <div sx={{ flex: "column", gap: [8, 20], justify: "space-between" }}>
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
        {data?.assetId ? (
          <APYStatsCard
            loading={loading || isLoadingFee}
            assetId={data.assetId}
            totalFee={data.totalFee}
            isFarms={!!data.farms.length}
          />
        ) : (
          <AssetStatsCard title={t("stats.omnipool.stats.card.apy")} loading />
        )}
        <AssetStatsCard
          title={t("stats.omnipool.stats.card.percentage")}
          value={t("value.percentage", { value: data?.share })}
          loading={loading}
        />
      </div>
    </div>
  )
}
