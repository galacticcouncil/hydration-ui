import { Text } from "components/Typography/Text/Text"
import { SBar, SBarContainer, SContainer } from "./PreviewReferrer.styled"
import { SSeparator } from "components/Separator/Separator.styled"
import { ReactElement } from "react"
import { useTranslation } from "react-i18next"
import { ReferrerAddress } from "sections/referrals/components/ReferrerCard/ReferrerAddress"
import Skeleton from "react-loading-skeleton"
import { useReferrerTierData } from "sections/referrals/ReferralsPage.utils"

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
  const { t } = useTranslation()
  const { referrerInfo, currentTierData, tierProgress } =
    useReferrerTierData(referrerAddress)

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
                <Text font="GeistMono" fs={12}>
                  {currentTierData
                    ? t("value.percentage", {
                        value: currentTierData.user,
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
                <Text font="GeistMono" fs={12}>
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
                    percentage={tierProgress?.toNumber() ?? 0}
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
