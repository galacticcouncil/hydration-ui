import { TableSkeleton } from "components/Skeleton/TableSkeleton"
import { Spinner } from "components/Spinner/Spinner"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { SContainerVertical } from "sections/stats/StatsPage.styled"
import { AssetStatsCard } from "sections/stats/sections/omnipoolAsset/stats/AssetStatsCard"

export const StatsAssetPageSkeleton = () => {
  const { t } = useTranslation()
  return (
    <>
      <div
        sx={{
          flex: ["column", "row"],
          align: ["start", "center"],
          justify: "space-between",
          pb: [18, 40],
        }}
      >
        <div sx={{ flex: "row", gap: 16, align: "center" }}>
          <Skeleton sx={{ height: [30, 38], width: [30, 38] }} circle />
          <div>
            <Skeleton width={100} sx={{ height: [15, 28] }} />
            <Skeleton width={150} sx={{ height: [12, 13] }} />
          </div>
        </div>
        <div sx={{ flex: "column", align: "end" }}>
          <Skeleton width={200} sx={{ height: [18, 42] }} />
          <Skeleton width={200} sx={{ height: 12 }} />
        </div>
      </div>
      <div sx={{ flex: "column", gap: [24, 50] }}>
        <div sx={{ flex: ["column", "row"], gap: 20, height: ["auto", 570] }}>
          <div
            sx={{
              flex: "row",
              width: ["100%", 230],
              minWidth: 0,
            }}
          >
            <div sx={{ flex: ["column", "row"], gap: 20 }}>
              <div
                sx={{ flex: "column", gap: [8, 20], justify: "space-between" }}
              >
                <AssetStatsCard
                  title={t("stats.omnipool.stats.card.vlm")}
                  loading
                />
                <AssetStatsCard
                  title={t("stats.omnipool.stats.card.pol")}
                  loading
                />

                <AssetStatsCard
                  title={t("stats.omnipool.stats.card.apy")}
                  loading
                />
                <AssetStatsCard
                  title={t("stats.omnipool.stats.card.percentage")}
                  loading
                />
              </div>
            </div>
          </div>
          <SContainerVertical
            css={{ position: "relative" }}
            sx={{
              p: 24,
              justify: "space-between",
              flexGrow: 1,
              minWidth: 0,
              gap: 20,
              minHeight: 300,
            }}
          >
            <div>
              <div sx={{ flex: "row", gap: 20, mb: 20 }}>
                <Skeleton width={80} height={36} />
                <Skeleton width={80} height={36} />
              </div>
              <Skeleton width="30%" height={20} />
            </div>
            <div
              css={{ position: "absolute", inset: 0 }}
              sx={{ flex: "column", align: "center", justify: "center" }}
            >
              <Spinner size={50} />
            </div>
          </SContainerVertical>
        </div>
        <TableSkeleton titleSkeleton background="transparent" />
      </div>
    </>
  )
}
