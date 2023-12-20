import { useUserReferrer } from "api/referrals"
import ChainlinkIcon from "assets/icons/ChainlinkIcon.svg?react"
import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { ReferrerAddress } from "./ReferrerAddress"
import { ReferrerSignForm } from "./ReferrerSignForm"
import Skeleton from "react-loading-skeleton"

export const ReferrerCard = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const referrer = useUserReferrer(account?.address)

  return (
    <Card title="Your referrer" variant="secondary" icon={<ChainlinkIcon />}>
      {referrer.isInitialLoading ? (
        <Skeleton css={{ width: "100%" }} height={38} />
      ) : referrer.data ? (
        <div
          sx={{
            flex: ["column", "row"],
            gap: [20, 10],
            justify: "space-between",
            align: "center",
          }}
        >
          <FeatureBox
            sx={{ width: "auto" }}
            label={t("referrals.referrer.account")}
            title={<ReferrerAddress referrerAddress={referrer.data} />}
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
        </div>
      ) : (
        <ReferrerSignForm />
      )}
    </Card>
  )
}
