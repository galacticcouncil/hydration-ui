import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { ReferrerAddress } from "./ReferrerAddress"
import { useTranslation } from "react-i18next"
import { Text } from "components/Typography/Text/Text"
import { useReferrerInfo } from "api/referrals"
import {
  referralRewards,
  useReferrerTierData,
} from "sections/referrals/ReferralsPage.utils"
import Skeleton from "react-loading-skeleton"
import {
  SBar,
  SBarContainer,
} from "sections/referrals/components/PreviewReferrer/PreviewReferrer.styled"

export const ReferrerInfo = ({
  referrerAddress,
}: {
  referrerAddress: string
}) => {
  const { t } = useTranslation()

  const referrerInfo = useReferrerInfo(referrerAddress)
  const { tierProgress } = useReferrerTierData(referrerAddress)

  return (
    <div
      sx={{
        flex: ["column", "row"],
        gap: [20, 10],
        justify: "space-between",
        align: "start",
        width: "100%",
        flexWrap: "wrap",
      }}
    >
      <FeatureBox
        sx={{ width: "auto" }}
        css={{ flex: "1 0 33%" }}
        label={t("referrals.referrer.account")}
        title={
          <ReferrerAddress referrerAddress={referrerAddress} showReferralCode />
        }
      />
      <FeatureBox
        sx={{ width: "min-content" }}
        css={{ flex: "1 0 33%" }}
        label={t("referrals.referrer.tier")}
        title={
          referrerInfo.isLoading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <Text font="GeistMono" fs={19}>
              {referrerInfo.data?.tier ?? "-"}
            </Text>
          )
        }
      />
      <FeatureBox
        sx={{ width: "min-content" }}
        label={t("referrals.referrer.feeRewards")}
        title={
          referrerInfo.isLoading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <Text font="GeistMono" fs={19}>
              {referrerInfo.data && referrerInfo.data.tier !== undefined
                ? t("value.percentage", {
                    value: referralRewards[referrerInfo.data.tier]?.user,
                  })
                : "-"}
            </Text>
          )
        }
      />
      <FeatureBox
        sx={{ width: "100%" }}
        css={{ flex: 1, flexBasis: "100%" }}
        label={t("referrals.referrer.preview.progress")}
        title={
          referrerInfo.isLoading ? (
            <Skeleton width={140} height={40} />
          ) : (
            <SBarContainer>
              <SBar percentage={tierProgress?.toNumber() ?? 0} variant="pink" />
            </SBarContainer>
          )
        }
      />
    </div>
  )
}
