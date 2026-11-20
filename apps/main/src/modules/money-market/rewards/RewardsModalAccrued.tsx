import { Flex, Icon, Text } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Clock } from "lucide-react"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { type RewardsDistributorAccrued } from "@/api/rewardsDistributor"
import { getAccruedStageParts } from "@/components/DistributorAccruedRewards/DistributorAccruedRewards.utils"

type RewardsModalAccruedProps = {
  stages: RewardsDistributorAccrued["stages"]
  symbol: string
}

/**
 * The distributor's rewards that are not claimable yet, as the rewards window
 * lists them: the amount on the left and when it becomes claimable on the right.
 */
export const RewardsModalAccrued: FC<RewardsModalAccruedProps> = ({
  stages,
  symbol,
}) => {
  const { t } = useTranslation()

  if (stages.length === 0) return null

  return (
    <Flex direction="column" gap="xs">
      {stages.map((stage) => {
        const { amount, when } = getAccruedStageParts(t, stage, symbol)

        return (
          <Flex
            key={stage.stage}
            justify="space-between"
            align="center"
            gap="m"
          >
            <Flex align="center" gap="xs" sx={{ flexShrink: 0 }}>
              <Icon
                size={12}
                component={Clock}
                color={getToken("text.medium")}
              />
              <Text fs="p6" lh={1.2} color={getToken("text.high")}>
                {amount}
              </Text>
            </Flex>
            {when && (
              <Text
                fs="p6"
                lh={1.2}
                align="right"
                color={getToken("text.medium")}
              >
                {when}
              </Text>
            )}
          </Flex>
        )
      })}
    </Flex>
  )
}
