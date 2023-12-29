import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const TierStats = () => {
  const { t } = useTranslation()
  return (
    <div sx={{ flex: ["column", "row"], gap: [30, 20] }}>
      <Card>
        <div sx={{ flex: ["column", "row"], gap: [12, 40] }}>
          <FeatureBox
            label={
              <Text css={{ whiteSpace: "nowrap" }} color="green500" fs={14}>
                {t("referrals.tiers.title")}
              </Text>
            }
            title={
              <Text font="FontOver" fs={19}>
                {t("referrals.tiers.tier")} {t("referrals.tiers.tier1")}
              </Text>
            }
          />
          <FeatureBox
            sx={{ ml: "auto", flexGrow: "0" }}
            label={
              <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
                {t("referrals.referrer.fee")}
              </Text>
            }
            title={
              <Text font="FontOver" tAlign={["left", "right"]} fs={16}>
                10%
              </Text>
            }
          />
          <FeatureBox
            sx={{ ml: "auto", flexGrow: "0" }}
            label={
              <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
                {t("referrals.referee.fee")}
              </Text>
            }
            title={
              <Text font="FontOver" tAlign={["left", "right"]} fs={16}>
                5%
              </Text>
            }
          />
          <FeatureBox
            label={
              <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
                {t("referrals.referrer.progress")}
              </Text>
            }
            title={
              <Text font="FontOver" fs={16}>
                {t("referrals.tiers.tier")} {t("referrals.tiers.tier1")}
              </Text>
            }
          />
        </div>
      </Card>
    </div>
  )
}
