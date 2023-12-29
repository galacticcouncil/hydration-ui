import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { ReferrerAddress } from "./ReferrerAddress"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useReferrerInfo } from "api/referrals"
import { referralRewards } from "sections/referrals/ReferralsPage.utils"
import Skeleton from "react-loading-skeleton"

export const ReferrerInfo = ({
  referrerAddress,
}: {
  referrerAddress: string
}) => {
  const { t } = useTranslation()

  const referrerInfo = useReferrerInfo(referrerAddress)

  return (
    <div
      sx={{
        flex: ["column", "row"],
        gap: [20, 10],
        justify: "space-between",
        align: "center",
      }}
    >
      <FeatureBox
        sx={{ width: "auto", flexGrow: 2 }}
        label={t("referrals.referrer.account")}
        title={
          <ReferrerAddress referrerAddress={referrerAddress} showReferralCode />
        }
      />
      <FeatureBox
        sx={{ width: "auto", flexGrow: 1 }}
        label={t("referrals.referrer.tier")}
        title={
          referrerInfo.isLoading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <Text font="FontOver" fs={19}>
              {referrerInfo.data?.tier ?? "-"}
            </Text>
          )
        }
      />
      <FeatureBox
        sx={{ width: "min-content" }}
        css={{ flex: "unset" }}
        label={t("referrals.referrer.feeRewards")}
        title={
          referrerInfo.isLoading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <Text font="FontOver" fs={19}>
              {referrerInfo.data
                ? t("value.percentage", {
                    value: referralRewards[referrerInfo.data.tier].user,
                  })
                : "-"}
            </Text>
          )
        }
      />
    </div>
  )
}
