import { Text } from "components/Typography/Text/Text"
import { GigaBannerContainer } from "./GigaCampaignBanner.styled"
import { useTranslation } from "react-i18next"
import { ReactNode } from "react"

export const GigaCampaignBanner = ({ action }: { action?: ReactNode }) => {
  const { t } = useTranslation()

  return (
    <GigaBannerContainer sx={{ mt: 12 }}>
      <div sx={{ flex: "column" }}>
        <Text
          fs={16}
          color="black"
          font="Gazpacho"
          css={{ textShadow: "0px 0px 5.9px #FFF" }}
        >
          {t("giga.campaign.title")}
        </Text>
        <Text fs={13} color="black" css={{ textShadow: "0px 0px 5.9px #FFF" }}>
          {t("giga.campaign.description")}
        </Text>
        <Text fs={13} color="black" css={{ textShadow: "0px 0px 5.9px #FFF" }}>
          {t("giga.campaign.description2")}
        </Text>
      </div>
      {action}
    </GigaBannerContainer>
  )
}
