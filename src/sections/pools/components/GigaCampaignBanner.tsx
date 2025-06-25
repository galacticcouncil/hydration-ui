import { Text } from "components/Typography/Text/Text"
import { GigaBannerContainer } from "./GigaCampaignBanner.styled"
import { useTranslation } from "react-i18next"

export const GigaCampaignBanner = () => {
  const { t } = useTranslation()

  return (
    <GigaBannerContainer sx={{ mt: 12 }}>
      <div sx={{ flex: "column", gap: 6 }}>
        <Text fs={16} color="black" font="GeistSemiBold">
          {t("giga.campaign.title")}
        </Text>
        <Text fs={13} color="black" font="GeistMedium">
          {t("giga.campaign.description")}
        </Text>
      </div>
    </GigaBannerContainer>
  )
}
