import { useReferralCodes } from "api/referrals"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import { useAccountIdentity } from "api/stats"
import Skeleton from "react-loading-skeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { ResponsiveValue } from "utils/responsive"

export const ReferrerAddress = ({
  referrerAddress,
  showReferralCode,
  fs = 19,
}: {
  referrerAddress: string
  showReferralCode?: boolean
  fs?: ResponsiveValue<number>
}) => {
  const { t } = useTranslation()

  const referral = useReferralCodes(getChainSpecificAddress(referrerAddress))
  const identity = useAccountIdentity(getChainSpecificAddress(referrerAddress))

  const referralCode = referral.data?.[0]?.referralCode

  return (
    <div sx={{ flex: "column", gap: 2 }}>
      <Text font="FontOver" fs={fs}>
        {identity.isInitialLoading ? (
          <Skeleton sx={{ height: fs }} width={180} />
        ) : identity.data?.identity ? (
          identity.data.identity
        ) : (
          shortenAccountAddress(getChainSpecificAddress(referrerAddress), 6)
        )}
      </Text>
      {showReferralCode && (
        <div sx={{ flex: "row", gap: 4, align: "center" }}>
          <Text fs={11} color="white" css={{ opacity: "0.7" }}>
            {t("referrals.referrer.code")}
          </Text>
          {referral.isInitialLoading ? (
            <Skeleton height={12} width={60} />
          ) : (
            <Text fs={12} color="brightBlue300">
              {referralCode}
            </Text>
          )}
        </div>
      )}
    </div>
  )
}
