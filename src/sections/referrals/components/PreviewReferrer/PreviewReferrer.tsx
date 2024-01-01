import { Text } from "components/Typography/Text/Text"
import { SBar, SBarContainer, SContainer } from "./PreviewReferrer.styled"
import { SSeparator } from "components/Separator/Separator.styled"
import { useReferrerInfo } from "api/referrals"
import { ReactElement, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ReferrerAddress } from "sections/referrals/components/ReferrerCard/ReferrerAddress"
import Skeleton from "react-loading-skeleton"
import { referralRewards } from "sections/referrals/ReferralsPage.utils"
import { useAccountRewards } from "sections/referrals/components/RewardsCard/Rewards.utils"
import { useRpcProvider } from "providers/rpcProvider"
import BN from "bignumber.js"

const Option = ({
  label,
  children,
  className,
}: {
  label: string
  children: ReactElement
  className?: string
}) => {
  return (
    <div
      sx={{
        flex: "column",
        gap: 8,
        justify: "space-between",
        width: ["100%", "inherit"],
      }}
      className={className}
    >
      <Text
        color="white"
        fs={11}
        tTransform="uppercase"
        sx={{ opacity: "0.6" }}
        css={{ whiteSpace: "nowrap" }}
      >
        {label}
      </Text>
      {children}
    </div>
  )
}

export const PreviewReferrer = ({
  referrerAddress,
  isPopover,
  className,
}: {
  referrerAddress?: string
  isPopover?: boolean
  className?: string
}) => {
  const {
    assets: { native },
  } = useRpcProvider()
  const { t } = useTranslation()
  const referrerInfo = useReferrerInfo(referrerAddress)
  const accountRewards = useAccountRewards(referrerAddress)

  const tierData = referrerInfo.data
    ? referralRewards[referrerInfo.data.tier]
    : undefined

  const percentage = useMemo(() => {
    const totalRewards = referrerInfo.data?.paidRewards
      .shiftedBy(-native.decimals)
      .plus(accountRewards.data ?? 0)

    const nextTierData = referrerInfo.data
      ? referralRewards[referrerInfo.data.tier + 1]
      : undefined

    if (totalRewards && nextTierData) {
      return totalRewards.gt(nextTierData.threshold)
        ? BN(100)
        : totalRewards.div(nextTierData.threshold).multipliedBy(100)
    }

    return undefined
  }, [accountRewards.data, native.decimals, referrerInfo.data])

  return (
    <div css={{ position: "relative" }}>
      {referrerAddress && (
        <SContainer isPopover={!!isPopover} className={className}>
          <div sx={{ p: "10px 20px" }}>
            <Text color="brightBlue200" fs={11}>
              {t("referrals.referrer.preview.label")}
            </Text>
          </div>

          <SSeparator color="white" opacity={0.12} />
          <div
            sx={{
              p: 20,
              flex: "row",
              gap: 20,
              flexWrap: "wrap",
              justify: "space-between",
            }}
          >
            <Option label={t("referrals.referrer.account")} css={{ flex: 0 }}>
              <ReferrerAddress referrerAddress={referrerAddress} fs={12} />
            </Option>

            <Option
              label={t("referrals.referrer.feeRewards")}
              css={{ flex: 0 }}
            >
              {referrerInfo.isLoading ? (
                <Skeleton
                  width={60}
                  height={12}
                  css={{ verticalAlign: "middle" }}
                />
              ) : (
                <Text font="FontOver" fs={12}>
                  {tierData
                    ? t("value.percentage", {
                        value: tierData.user,
                      })
                    : "-"}
                </Text>
              )}
            </Option>

            <Option
              label={t("referrals.referrer.preview.tier")}
              css={{ flex: 0 }}
            >
              {referrerInfo.isLoading ? (
                <Skeleton
                  width={50}
                  height={12}
                  css={{ verticalAlign: "middle" }}
                />
              ) : (
                <Text font="FontOver" fs={12}>
                  {referrerInfo.data?.tier ?? "-"}
                </Text>
              )}
            </Option>

            <Option
              label={t("referrals.referrer.preview.progress")}
              css={{ minWidth: "200px" }}
            >
              {referrerInfo.isLoading ? (
                <Skeleton
                  width={140}
                  height={12}
                  css={{ verticalAlign: "middle" }}
                />
              ) : (
                <SBarContainer>
                  <SBar
                    percentage={percentage?.toNumber() ?? 0}
                    variant="pink"
                  />
                </SBarContainer>
              )}
            </Option>
          </div>
        </SContainer>
      )}
    </div>
  )
}
