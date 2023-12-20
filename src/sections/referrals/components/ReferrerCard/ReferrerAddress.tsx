import { useReferralCodes } from "api/referrals"
import { convertToHydraAddress } from "sections/referrals/components/CodeForm/CodeForm.utils"
import {
  getChainSpecificAddress,
  shortenAccountAddress,
} from "utils/formatting"
import { useAccountIdentity } from "api/stats"
import Skeleton from "react-loading-skeleton"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"

export const ReferrerAddress = ({
  referrerAddress,
}: {
  referrerAddress: string
}) => {
  const { t } = useTranslation()

  const referral = useReferralCodes(convertToHydraAddress(referrerAddress))
  const identity = useAccountIdentity(convertToHydraAddress(referrerAddress))

  const referralCode = referral.data?.[0]?.referralCode

  return (
    <div sx={{ flex: "column", gap: 2 }}>
      <Text font="FontOver" fs={19}>
        {identity.isInitialLoading ? (
          <Skeleton height={22} width={200} />
        ) : identity.data?.identity ? (
          identity.data.identity
        ) : (
          shortenAccountAddress(getChainSpecificAddress(referrerAddress), 6)
        )}
      </Text>
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
    </div>
  )
}
