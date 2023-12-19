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
            label={<Text color="green500">{t("referrals.tiers.title")}</Text>}
            title={
              <Text font="FontOver" fs={19}>
                {t("referrals.tiers.tier")} {t("referrals.tiers.tier1")}
              </Text>
            }
          />
          <FeatureBox
            sx={{ ml: "auto", flexGrow: "0" }}
            label={<Text color="basic400">{t("referrals.referrer.fee")}</Text>}
            title={
              <Text font="FontOver" tAlign={["left", "right"]} fs={19}>
                10%
              </Text>
            }
          />
          <FeatureBox
            sx={{ ml: "auto", flexGrow: "0" }}
            label={<Text color="basic400">{t("referrals.referrer.fee")}</Text>}
            title={
              <Text font="FontOver" tAlign={["left", "right"]} fs={19}>
                5%
              </Text>
            }
          />
        </div>
      </Card>
      <Card>
        <FeatureBox
          sx={{ flexGrow: 1, flexBasis: 0, flexShrink: 1 }}
          label={
            <Text color="vibrantBlue100">{t("referrals.frens.title")}</Text>
          }
          title={
            <Text font="FontOver" fs={19}>
              10
            </Text>
          }
        />
      </Card>
    </div>
  )
}
