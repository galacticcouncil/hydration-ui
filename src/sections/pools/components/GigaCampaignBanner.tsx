import { Text } from "components/Typography/Text/Text"
import { GigaBannerContainer } from "./GigaCampaignBanner.styled"
import { useTranslation } from "react-i18next"
import { Icon } from "components/Icon/Icon"
import Title from "assets/icons/gigaCampaignTitle.svg?react"

export const GigaCampaignBanner = () => {
  const { t } = useTranslation()

  return (
    <GigaBannerContainer sx={{ mt: 12 }}>
      <div sx={{ flex: "column", gap: 6 }}>
        <Icon icon={<Title />} />
        <Text fs={13} color="black">
          {t("giga.campaign.description")}
        </Text>
      </div>
    </GigaBannerContainer>
  )
}
