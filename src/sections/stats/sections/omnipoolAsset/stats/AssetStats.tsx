import { useTranslation } from "react-i18next"
import { AssetStatsCard } from "./AssetStatsCard"
import BN from "bignumber.js"
import { Farm, useFarmAprs, useFarms } from "api/farms"
import { useMemo } from "react"
import { BN_0 } from "utils/constants"
import { useRpcProvider } from "providers/rpcProvider"

const APYFarmStatsCard = ({ farms, apy }: { farms: Farm[]; apy: number }) => {
  const { t } = useTranslation()
  const farmAprs = useFarmAprs(farms)

  const percentage = useMemo(() => {
    if (farmAprs.data?.length) {
      const aprs = farmAprs.data
        ? farmAprs.data.reduce((memo, { apr }) => memo.plus(apr), BN_0)
        : BN_0
      const minAprs = farmAprs.data
        ? farmAprs.data.map(({ minApr, apr }) => (minApr ? minApr : apr))
        : [BN_0]

      const minApr = BN.minimum(...minAprs)
      const maxApr = aprs

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
      title={t("stats.omnipool.stats.card.apyWithFarm")}
      value={t("value.percentage.range", {
        from: percentage.minApr.lt(apy) ? percentage.minApr : BN(apy),
        to: percentage.maxApr.plus(apy),
      })}
      loading={farmAprs.isInitialLoading}
      tooltip={t("stats.overview.table.assets.header.apy.desc")}
    />
  )
}

const APYStatsCard = ({
  loading,
  assetId,
  fee,
}: {
  loading?: boolean
  assetId: string
  fee: BN
}) => {
  const { t } = useTranslation()
  const {
    assets: { native },
  } = useRpcProvider()
  const farms = useFarms([assetId])

  if (farms.data?.length)
    return <APYFarmStatsCard farms={farms.data} apy={fee.toNumber()} />

  return (
    <AssetStatsCard
      title={t("stats.omnipool.stats.card.apy")}
      value={
        assetId === native.id ? "--" : t("value.percentage", { value: fee })
      }
      loading={loading || farms.isInitialLoading}
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
  data?: { pol: BN; vlm: BN; cap: BN; share: BN; assetId: string; fee: BN }
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
            fee={data.fee}
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
