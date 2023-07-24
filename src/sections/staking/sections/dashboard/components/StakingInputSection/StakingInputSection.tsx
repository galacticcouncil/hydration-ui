import { useState } from "react"
import {
  SSectionContainer,
  SSectionHeader,
  SStakeTab,
} from "./StakingInputSection.styled"
import { Stake } from "./Stake/Stake"
import { Unstake } from "./Unstake/Unstake"
import { TStakingData } from "api/staking"
import { BN_0 } from "utils/constants"

const stakeActions = ["stake", "unstake"] as const

type StakeAction = (typeof stakeActions)[number]

export const StakingInputSection = ({
  loading,
  data,
}: {
  loading?: boolean
  data?: TStakingData
}) => {
  const [activeStakeAction, setActiveStakeAction] =
    useState<StakeAction>("stake")

  const stakedValue = data?.stakingPosition?.stake.shiftedBy(-12) ?? BN_0

  return (
    <SSectionContainer>
      <SSectionHeader>
        {stakeActions.map((action) => (
          <SStakeTab
            key={action}
            active={action === activeStakeAction}
            onClick={() => setActiveStakeAction(action)}
          >
            <p>{action}</p>
          </SStakeTab>
        ))}
      </SSectionHeader>
      <div sx={{ p: "0px 20px 20px" }}>
        {activeStakeAction === "stake" ? (
          <Stake
            loading={!!loading}
            stakingId={data?.stakingId}
            minStake={data?.minStake}
          />
        ) : (
          <Unstake loading={!!loading} staked={stakedValue} />
        )}
      </div>
    </SSectionContainer>
  )
}
