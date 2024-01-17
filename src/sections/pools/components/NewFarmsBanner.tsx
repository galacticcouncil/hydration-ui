import { useFarmsPoolAssets } from "api/farms"
import { NewFarmsBannerContainer } from "./NewFarmsBanner.styled"
import { useRpcProvider } from "providers/rpcProvider"
import { Text } from "components/Typography/Text/Text"
import { SSeparator } from "components/Separator/Separator.styled"
import { Link } from "@tanstack/react-location"
import { LINKS } from "utils/navigation"
import { useTranslation } from "react-i18next"
import Star from "assets/icons/Star.svg?react"
import { Icon } from "components/Icon/Icon"

export const NewFarmsBanner = () => {
  const { assets } = useRpcProvider()
  const { t } = useTranslation()
  const poolAssets = useFarmsPoolAssets()

  if (!poolAssets.data?.length) return null

  return (
    <NewFarmsBannerContainer>
      <div sx={{ flex: "row", gap: 4, align: "center" }}>
        <Icon icon={<Star />} sx={{ color: "white" }} />
        <Text fs={11} color="white">
          {t("banner.newFarms.label", {
            symbols: poolAssets.data
              .map((poolAsset) => assets.getAsset(poolAsset.toString()).symbol)
              .join(" & "),
          })}
        </Text>
      </div>

      <SSeparator
        orientation="vertical"
        sx={{ height: 12 }}
        color="white"
        opacity={0.2}
      />
      <Link to={LINKS.omnipool}>
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <Text
            fs={11}
            color="white"
            sx={{ opacity: 0.7 }}
            css={{ textDecoration: "underline" }}
          >
            {t("banner.newFarms.link")}
          </Text>
        </div>
      </Link>
    </NewFarmsBannerContainer>
  )
}
