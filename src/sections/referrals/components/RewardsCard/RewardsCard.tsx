import Treasury from "assets/icons/Treasury.svg?react"
import { Button } from "components/Button/Button"
import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const RewardsCard = () => {
  const { t } = useTranslation()
  return (
    <Card
      title={t("referrals.rewards.title")}
      variant="primary"
      icon={<Treasury width={16} height={16} />}
      css={{ flexGrow: 1 }}
    >
      <div
        sx={{
          flex: ["column", "row"],
          flexWrap: ["wrap", "nowrap"],
          gap: [20],
        }}
      >
        <FeatureBox
          label="Generated from referral links"
          title={
            <Text font="FontOver" fs={19}>
              1242.23 HDX
            </Text>
          }
        />
        <Button css={{ whiteSpace: "nowrap" }} variant="primary">
          {t("referrals.rewards.claim")}
        </Button>
      </div>
    </Card>
  )
}
