import { Card } from "components/Card/Card"
import { FeatureBox } from "components/FeatureBox/FeatureBox"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import Skeleton from "react-loading-skeleton"
import { useReferrerTierData } from "sections/referrals/ReferralsPage.utils"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getChainSpecificAddress } from "utils/formatting"
import {
  SBar,
  SBarContainer,
} from "sections/referrals/components/PreviewReferrer/PreviewReferrer.styled"
import { Icon } from "components/Icon/Icon"
import LevelUp from "assets/icons/LevelUp.svg?react"

export const TierStats = () => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const referrerAddress = account?.address
    ? getChainSpecificAddress(account.address)
    : undefined

  const { referrerInfo, currentTierData, tierProgress, isLevelUp } =
    useReferrerTierData(referrerAddress)

  return (
    <Card css={{ paddingTop: 14 }}>
      <div sx={{ flex: ["column", "row"], gap: [12, 40], width: "100%" }}>
        <FeatureBox
          css={{ width: "25%", flex: 0 }}
          label={
            <Text css={{ whiteSpace: "nowrap" }} color="green500" fs={14}>
              {t("referrals.tiers.title")}
            </Text>
          }
          title={
            referrerInfo.isLoading ? (
              <Skeleton height={19} width={50} />
            ) : (
              <Text font="FontOver" fs={19} css={{ whiteSpace: "nowrap" }}>
                {t("referrals.tiers.tier", {
                  tier: referrerInfo.data?.tier?.toString(),
                })}
              </Text>
            )
          }
        />
        <FeatureBox
          sx={{ ml: "auto", flexGrow: "0" }}
          label={
            <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
              {t("referrals.referrer.fee")}
            </Text>
          }
          title={
            <Text font="FontOver" tAlign={["left", "right"]} fs={16}>
              {currentTierData
                ? t("value.percentage", {
                    value: currentTierData.referrer,
                  })
                : "-"}
            </Text>
          }
        />
        <FeatureBox
          sx={{ ml: "auto", flexGrow: "0" }}
          label={
            <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
              {t("referrals.referee.fee")}
            </Text>
          }
          title={
            <Text font="FontOver" tAlign={["left", "right"]} fs={16}>
              {currentTierData
                ? t("value.percentage", {
                    value: currentTierData.user,
                  })
                : "-"}
            </Text>
          }
        />
        <FeatureBox
          css={{ flex: 1 }}
          label={
            <Text css={{ whiteSpace: "nowrap" }} color="basic400" fs={14}>
              {t("referrals.referrer.progress")}
            </Text>
          }
          secondaryLabel={
            isLevelUp && (
              <div sx={{ flex: "row", gap: 10 }}>
                <Text
                  css={{ whiteSpace: "nowrap" }}
                  color="green500"
                  fs={14}
                  font="FontOver"
                >
                  {t("referrals.referrer.levelup")}
                </Text>
                <Icon sx={{ color: "green500" }} icon={<LevelUp />} />
              </div>
            )
          }
          title={
            <SBarContainer>
              <SBar
                percentage={tierProgress?.toNumber() ?? 0}
                variant="green"
              />
            </SBarContainer>
          }
        />
      </div>
    </Card>
  )
}
