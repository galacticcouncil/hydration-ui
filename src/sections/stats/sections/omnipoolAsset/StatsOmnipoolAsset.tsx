import { ReactComponent as ChevronDownIcon } from "assets/icons/ChevronRight.svg"
import {
  BackButton,
  SOmnipoolAssetContainer,
} from "./StatsOmnipoolAsset.styled"
import { MakeGenerics, useNavigate, useSearch } from "@tanstack/react-location"
import { Text } from "components/Typography/Text/Text"
import { Icon } from "components/Icon/Icon"
import { useAsset } from "api/asset"
import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { useOmnipoolOverviewData } from "../overview/data/OmnipoolOverview.utils"
import { useTranslation } from "react-i18next"
import { AssetStats } from "./stats/AssetStats"
import { LiquidityProvidersTableWrapper } from "./LiquidityProvidersTable/LiquidityProvidersTableWrapper"
import { Spacer } from "components/Spacer/Spacer"
import BN from "bignumber.js"
import Skeleton from "react-loading-skeleton"
import { useMedia } from "react-use"
import { theme } from "theme"
import { BN_0 } from "utils/constants"
import { RecentTradesTableWrapperData } from "sections/stats/components/RecentTradesTable/RecentTradesTableWrapper"
import { RecentTradesTableSkeleton } from "sections/stats/components/RecentTradesTable/skeleton/RecentTradesTableSkeleton"
//import { useUniquesAsset } from "api/uniques"

type SearchGenerics = MakeGenerics<{
  Search: { asset: number }
}>

const OmnipoolAssetNavigation = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <>
      <div sx={{ flex: "row", gap: 10, align: "center", mb: 15 }}>
        <BackButton
          name="Expand"
          icon={<ChevronDownIcon />}
          onClick={() => navigate({ to: "" })} // mb add a scroll position
          size={24}
        />
        <Text fs={13} tTransform="uppercase" color="white">
          {t("stats.omnipool.navigation.back")}
        </Text>
      </div>
      <div
        sx={{ height: 1, width: "100vw" }}
        css={{
          background: "rgba(84, 99, 128, 0.35)",
          position: "absolute",
          left: 0,
        }}
      />
    </>
  )
}

const OmnipoolAssetHeader = ({
  loading,
  assetId,
  tvl,
}: {
  loading?: boolean
  assetId?: string
  tvl?: BN
}) => {
  const { t } = useTranslation()
  const asset = useAsset(loading ? undefined : assetId)
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const isLoading = loading || asset.isLoading

  return (
    <div
      sx={{
        flex: "row",
        align: "center",
        justify: "space-between",
        py: [18, 40],
      }}
    >
      <div sx={{ flex: "row", gap: 16, align: "center" }}>
        {isLoading || !asset.data ? (
          <Skeleton
            width={isDesktop ? 38 : 30}
            height={isDesktop ? 38 : 30}
            circle
          />
        ) : (
          <Icon size={[30, 38]} icon={asset.data.icon} />
        )}

        <div>
          {isLoading || !asset.data ? (
            <>
              <Skeleton width={100} height={isDesktop ? 28 : 15} />
              <Skeleton width={150} height={isDesktop ? 13 : 12} />
            </>
          ) : (
            <>
              <Text fs={[15, 28]} font="FontOver" color="white">
                {asset.data.symbol}
              </Text>
              <Text fs={[12, 13]} tTransform="uppercase" color="white">
                {asset.data.name}
              </Text>
            </>
          )}
        </div>
      </div>

      <div sx={{ flex: "column", align: "end" }}>
        {isLoading || !tvl ? (
          <Skeleton width={200} height={isDesktop ? 42 : 18} />
        ) : (
          <Text fs={[18, 42]} font="FontOver">
            {t("value.usd", { amount: tvl })}
          </Text>
        )}

        <Text fs={[12, 16]} color="brightBlue300">
          {t("totalValueLocked")}
        </Text>
      </div>
    </div>
  )
}

export const StatsOmnipoolAsset = () => {
  const api = useApiPromise()
  const search = useSearch<SearchGenerics>()
  const assetId = search.asset?.toString()

  if (!isApiLoaded(api) || !assetId) return <StatsOmnipoolAssetSkeleton />

  return <StatsOmnipoolAssetData assetId={assetId} />
}

const StatsOmnipoolAssetData = ({ assetId }: { assetId: string }) => {
  const overviewData = useOmnipoolOverviewData()
  //const test = useUniquesAsset("1337")
  //console.log(test)
  const omnipoolAsset = overviewData.data.find(
    (overview) => overview.id === assetId,
  )

  const omnipollTvl = overviewData.data.reduce(
    (acc, asset) => acc.plus(asset.tvl),
    BN_0,
  )

  if (!omnipoolAsset || overviewData.isLoading)
    return <StatsOmnipoolAssetSkeleton />

  return (
    <div>
      <SOmnipoolAssetContainer>
        <OmnipoolAssetNavigation />
        <OmnipoolAssetHeader assetId={assetId} tvl={omnipoolAsset.tvl} />
        <AssetStats
          data={{
            vlm: omnipoolAsset.volume,
            cap: omnipoolAsset.cap.multipliedBy(100),
            pol: omnipoolAsset.pol,
            share: omnipoolAsset.tvl.div(omnipollTvl).multipliedBy(100),
          }}
        />
        <LiquidityProvidersTableWrapper />
        <Spacer size={[24, 60]} />
        <RecentTradesTableWrapperData assetId={assetId} />
      </SOmnipoolAssetContainer>
    </div>
  )
}

const StatsOmnipoolAssetSkeleton = () => {
  return (
    <SOmnipoolAssetContainer>
      <OmnipoolAssetNavigation />
      <OmnipoolAssetHeader loading />
      <AssetStats loading />
      <LiquidityProvidersTableWrapper />
      <Spacer size={[24, 60]} />
      <RecentTradesTableSkeleton />
    </SOmnipoolAssetContainer>
  )
}
