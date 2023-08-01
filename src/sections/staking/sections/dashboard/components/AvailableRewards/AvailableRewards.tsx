import { Text } from "components/Typography/Text/Text"
import { ReactComponent as RewardIcon } from "assets/icons/StakingRewardIcon.svg"

import {
  SRewardCardContainer,
  SRewartCardHeader,
} from "./AvailableRewards.styled"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"
import { useClaimReward } from "api/staking"
import { useDisplayPrice } from "utils/displayAsset"
import { DisplayValue } from "components/DisplayValue/DisplayValue"
import { NATIVE_ASSET_ID } from "utils/api"
import Skeleton from "react-loading-skeleton"

export const AvailableRewards = ({
  positionId,
}: {
  positionId: number | undefined
}) => {
  const { t } = useTranslation()
  const reward = useClaimReward()
  const spotPrice = useDisplayPrice(NATIVE_ASSET_ID)

  const isLoading = reward.isLoading || spotPrice.isLoading

  return (
    <SRewardCardContainer>
      <SRewartCardHeader>
        <Icon sx={{ color: "pink600" }} icon={<RewardIcon />} />
        <Text
          fs={15}
          lh={15}
          sx={{ pt: 5 }}
          color="white"
          font="FontOver"
          tTransform="uppercase"
        >
          {t("staking.dashboard.rewards.title")}
        </Text>
      </SRewartCardHeader>
      <div sx={{ p: "28px 25px", flex: ["column", "row"], gap: 12 }}>
        <div sx={{ flex: "column", justify: "space-around" }}>
          {isLoading || !reward.data ? (
            <Skeleton width={90} height={25} />
          ) : (
            <Text
              fs={24}
              color="white"
              font="FontOver"
              tTransform="uppercase"
              css={{ whiteSpace: "nowrap" }}
            >
              {t("value.tokenWithSymbol", {
                value: reward.data.rewards,
                symbol: "HDX",
              })}
            </Text>
          )}
          {isLoading || !reward.data ? (
            <Skeleton width={60} height={16} />
          ) : (
            <Text fs={14} css={{ color: "rgba(255, 255, 255, 0.6)" }}>
              <DisplayValue
                value={reward.data.rewards.multipliedBy(
                  spotPrice.data?.spotPrice ?? 1,
                )}
              />
            </Text>
          )}
        </div>

        <Button
          variant="primary"
          fullWidth
          disabled={!reward.data || reward.data.rewards.isZero()}
        >
          {t("staking.dashboard.rewards.button")}
        </Button>
      </div>
    </SRewardCardContainer>
  )
}
