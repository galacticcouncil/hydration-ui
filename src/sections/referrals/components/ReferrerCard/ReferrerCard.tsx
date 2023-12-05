import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const ReferrerCard = () => {
  const { t } = useTranslation()
  return (
    <Card title="Your referrer" variant="secondary" icon={<ChainlinkIcon />}>
      <div
        sx={{
          flex: ["column", "row"],
          gap: [20, 10],
          justify: "space-between",
        }}
      >
        <FeatureBox
          sx={{ width: "auto" }}
          label={t("referrals.referrer.account")}
          title={
            <Text font="FontOver" fs={19}>
              7L16Y...vAr8
            </Text>
          }
        />
        <FeatureBox
          sx={{ width: "auto" }}
          label={t("referrals.referrer.tier")}
          title={
            <Text font="FontOver" fs={19}>
              {t("referrals.tiers.tier1")}
            </Text>
          }
        />
        <FeatureBox
          sx={{ width: "auto" }}
          label={t("referrals.referrer.discount")}
          title={
            <Text font="FontOver" fs={19}>
              0.25%
            </Text>
          }
        />
      </div>
    </Card>
  )
}
