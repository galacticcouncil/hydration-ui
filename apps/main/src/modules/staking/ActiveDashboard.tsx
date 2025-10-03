import { Flex } from "@galacticcouncil/ui/components"
import { getTokenPx } from "@galacticcouncil/ui/utils"
import { FC } from "react"

import { RewardsInfo } from "@/modules/staking/RewardsInfo"
import { RewardsList } from "@/modules/staking/RewardsList"

export const ActiveDashboard: FC = () => {
  return (
    <Flex
      px={getTokenPx("containers.paddings.primary")}
      pt={getTokenPx("containers.paddings.primary")}
      direction="column"
      gap={20}
    >
      <RewardsInfo />
      <RewardsList />
    </Flex>
  )
}
