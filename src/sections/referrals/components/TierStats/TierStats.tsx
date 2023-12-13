import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const TierStats = () => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: ["column", "row"], gap: [30, 20] }}>
      <FeatureBox
        bordered
        label={<Text color="green500">{t("referrals.tiers.title")}</Text>}
        title={
          <Text font="FontOver" fs={19}>
            {t("referrals.tiers.tier")} {t("referrals.tiers.tier1")}
          </Text>
        }
      />
      <FeatureBox
        bordered
        label={<Text color="vibrantBlue100">{t("referrals.frens.title")}</Text>}
        title={
          <Text font="FontOver" fs={19}>
            10
          </Text>
        }
      />
    </div>
  )
}
