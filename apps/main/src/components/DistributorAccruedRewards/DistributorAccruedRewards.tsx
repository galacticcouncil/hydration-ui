import { Flex, type FlexProps, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { type RewardsDistributorAccrued } from "@/api/rewardsDistributor"
import { getAccruedStageText } from "@/components/DistributorAccruedRewards/DistributorAccruedRewards.utils"

type DistributorAccruedRewardsProps = Omit<FlexProps, "children"> & {
  stages: RewardsDistributorAccrued["stages"]
  symbol: string
}

/** Rewards on the distributor that are not claimable yet, one line per stage. */
export const DistributorAccruedRewards: FC<DistributorAccruedRewardsProps> = ({
  stages,
  symbol,
  color = getToken("text.low"),
  ...props
}) => {
  const { t } = useTranslation()

  if (stages.length === 0) return null

  return (
    <Flex direction="column" gap="xs" {...props}>
      {stages.map((stage) => (
        <Text key={stage.stage} fs="p6" fw={400} lh={1.2} color={color}>
          {getAccruedStageText(t, stage, symbol)}
        </Text>
      ))}
    </Flex>
  )
}
