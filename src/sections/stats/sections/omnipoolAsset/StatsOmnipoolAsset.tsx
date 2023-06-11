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
import { RecentTradesTableWrapper } from "../overview/components/RecentTradesTable/RecentTradesTableWrapper"

type SearchGenerics = MakeGenerics<{
  Search: { asset: number }
}>

const OmnipoolAssetNavigation = () => {
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
          Back to stats
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

const OmnipoolAssetHeader = () => {
  const { t } = useTranslation()
  const search = useSearch<SearchGenerics>()
  const asset = useAsset(search.asset?.toString())
  const overViewData = useOmnipoolOverviewData()

  if (!asset.data || !overViewData.data) return null
  const myData = overViewData.data.find(
    (asset) => asset.id === search.asset?.toString(),
  )

  return (
    <div
      sx={{
        flex: "row",
        align: "center",
        justify: "space-between",
        height: 150,
      }}
    >
      <div sx={{ flex: "row", gap: 16, align: "center" }}>
        <Icon size={38} icon={asset.data.icon} />
        <div>
          <Text fs={28} lh={30} font="FontOver" color="white">
            {asset.data.symbol}
          </Text>
          <Text fs={13} tTransform="uppercase" color="white">
            {asset.data.name}
          </Text>
        </div>
      </div>

      <div sx={{ flex: "column", align: "end" }}>
        <div sx={{ flex: "row", gap: 2, align: "baseline" }}>
          <Text fs={42}>$</Text>
          <Text fs={42} font="FontOver">
            {t("value.usd", { amount: myData?.tvl, numberPrefix: "" })}
          </Text>
        </div>
        <Text color="brightBlue300">Total value locked</Text>
      </div>
    </div>
  )
}

export const StatsOmnipoolAsset = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return (
    <SOmnipoolAssetContainer>
      <OmnipoolAssetNavigation />
      <OmnipoolAssetHeader />
      <RecentTradesTableWrapper assetId={"0"} />
    </SOmnipoolAssetContainer>
  )
}
