import { Text } from "components/Typography/Text/Text"
import { GigaBannerContainer } from "./GigaCampaignBanner.styled"
import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import Title from "assets/icons/gigaCampaignTitle.svg?react"
import { ReactNode } from "react"

export const GigaCampaignBanner = ({ action }: { action?: ReactNode }) => {
  const { t } = useTranslation()

  return (
    <GigaBannerContainer sx={{ mt: 12 }}>
      <div sx={{ flex: "column" }}>
        <Icon icon={<Title />} sx={{ ml: -2 }} />
        <Text fs={13} color="black" css={{ textShadow: "0px 0px 5.9px #FFF" }}>
          {t("giga.campaign.description")}
        </Text>
      </div>
      {action}
    </GigaBannerContainer>
  )
}
