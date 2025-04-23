import { useState } from "react"
import {
  SSectionContainer,
  SSectionHeader,
  SStakeTab,
} from "./StakingInputSection.styled"
import { Stake } from "./Stake/Stake"
import { Unstake } from "./Unstake/Unstake"
import { BN_0 } from "utils/constants"
import { TStakingData } from "sections/staking/StakingPage.utils"

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

  const stakedValue = data?.stakePosition?.stake?.shiftedBy(-12) ?? BN_0

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
            positionId={data?.positionId}
            minStake={data?.minStake}
            balance={data?.availableBalance ?? BN_0}
          />
        ) : (
          <Unstake
            loading={!!loading}
            staked={stakedValue}
            positionId={data?.positionId}
          />
        )}
      </div>
    </SSectionContainer>
  )
}
