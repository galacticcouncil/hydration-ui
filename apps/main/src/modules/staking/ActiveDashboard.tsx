import Big from "big.js"
import { FC } from "react"

import { TAccountVote } from "@/api/democracy"
import { useStakingRewards } from "@/hooks/data/useStakingRewards"
import { SActiveDashboard } from "@/modules/staking/ActiveDashboard.styled"
import { RewardsInfo } from "@/modules/staking/RewardsInfo"
import { RewardsList } from "@/modules/staking/RewardsList"

type Props = {
  readonly positionId: bigint
  readonly votes: ReadonlyArray<TAccountVote>
  readonly votesSuccess: boolean
}

export const ActiveDashboard: FC<Props> = ({
  positionId,
  votes,
  votesSuccess,
}) => {
  const { data: stakingRewards, isLoading } = useStakingRewards()
  const unclaimableRewards = Big(stakingRewards?.maxRewards || "0")
    .sub(stakingRewards?.rewards || "0")
    .toString()

  return (
    <SActiveDashboard>
      <RewardsInfo
        allocatedRewards={stakingRewards?.maxRewards || "0"}
        isLoading={isLoading}
      />
      <RewardsList
        positionId={positionId}
        claimableRewards={stakingRewards?.rewards || "0"}
        unclaimableRewards={unclaimableRewards}
        allocatedRewardsPercentage={
          stakingRewards?.allocatedRewardsPercentage ?? 0
        }
        votes={votes}
        votesSuccess={votesSuccess}
        isLoading={isLoading}
      />
    </SActiveDashboard>
  )
}
