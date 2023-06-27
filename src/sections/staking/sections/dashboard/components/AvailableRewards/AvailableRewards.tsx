import { Text } from "components/Typography/Text/Text"
import { ReactComponent as RewardIcon } from "assets/icons/StakingRewardIcon.svg"

import {
  SRewardCardContainer,
  SRewartCardHeader,
} from "./AvailableRewards.styled"
import { Button } from "components/Button/Button"
import { Icon } from "components/Icon/Icon"
import { useTranslation } from "react-i18next"

export const AvailableRewards = () => {
  const { t } = useTranslation()

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
        <div>
          <Text
            fs={24}
            color="white"
            font="FontOver"
            tTransform="uppercase"
            css={{ whiteSpace: "nowrap" }}
          >
            TODO HDX
          </Text>
          <Text fs={14} css={{ color: "rgba(255, 255, 255, 0.6)" }}>
            ≈$ todo
          </Text>
        </div>

        <Button variant="primary" fullWidth>
          {t("staking.dashboard.rewards.button")}
        </Button>
      </div>
    </SRewardCardContainer>
  )
}
