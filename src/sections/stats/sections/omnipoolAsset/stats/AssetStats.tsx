import { useTranslation } from "react-i18next"
import { AssetStatsCard } from "./AssetStatsCard"
import BN from "bignumber.js"
import { useFee } from "api/stats"
import { Farm, useFarmAprs, useFarms } from "api/farms"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"

const APYFarmStatsCard = ({ farms, apy }: { farms: Farm[]; apy: number }) => {
  const { t } = useTranslation()
  const farmAprs = useFarmAprs(farms)

  const percentage = useMemo(() => {
    if (farmAprs.data?.length) {
      const aprs = farmAprs.data ? farmAprs.data.map(({ apr }) => apr) : [BN_0]
      const minAprs = farmAprs.data
        ? farmAprs.data.map(({ minApr, apr }) => (minApr ? minApr : apr))
        : [BN_0]

      const minApr = BN.minimum(...minAprs)
      const maxApr = BN.maximum(...aprs)

      return {
        minApr,
        maxApr,
      }
    }

    return {
      minApr: BN_0,
      maxApr: BN_0,
    }
  }, [farmAprs.data])

  return (
    <AssetStatsCard
      title={t("stats.omnipool.stats.card.apy")}
      value={t("value.percentage.range", {
        from: percentage.minApr.lt(apy) ? percentage.minApr : BN(apy),
        to: percentage.maxApr.plus(apy),
      })}
      loading={farmAprs.isInitialLoading}
    />
  )
}

const APYStatsCard = ({
  loading,
  assetId,
}: {
  loading?: boolean
  assetId: string
}) => {
  const { t } = useTranslation()

  const fee = useFee(assetId)
  const farms = useFarms([assetId])

  const apy = fee.data?.projected_apy_perc ?? 0

  if (farms.data?.length)
    return <APYFarmStatsCard farms={farms.data} apy={apy} />

  return (
    <AssetStatsCard
      title={t("stats.omnipool.stats.card.apy")}
      value={t("value.percentage", { value: apy })}
      loading={loading || fee.isInitialLoading || farms.isInitialLoading}
    />
  )
}

export const AssetStats = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: { pol: BN; vlm: BN; cap: BN; share: BN; assetId: string }
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
          <APYStatsCard loading={loading} assetId={data.assetId} />
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
