import { useState } from "react"
import {
  SSectionContainer,
  SSectionHeader,
  SStakeTab,
} from "./StakingInputSection.styled"
import { Stake } from "./Stake/Stake"
import { Unstake } from "./Unstake/Unstake"

const stakeActions = ["stake", "unstake"] as const

type StakeAction = (typeof stakeActions)[number]

export const StakingInputSection = ({ loading }: { loading?: boolean }) => {
  const [activeStakeAction, setActiveStakeAction] =
    useState<StakeAction>("stake")

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
      <div sx={{ p: "0px 20px 24px" }}>
        {activeStakeAction === "stake" ? (
          <Stake loading={!!loading} />
        ) : (
          <Unstake loading={!!loading} />
        )}
      </div>
    </SSectionContainer>
  )
}
