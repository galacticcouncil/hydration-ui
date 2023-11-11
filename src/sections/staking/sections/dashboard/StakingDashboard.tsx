import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Stats } from "./components/Stats/Stats"
import { Referenda, ReferendaWrapper } from "./components/Referenda/Referenda"
import { useStakeData } from "sections/staking/StakingPage.utils"
import { useRpcProvider } from "providers/rpcProvider"

export const StakingDashboard = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <StakingSkeleton />

  return <StakingData />
}

export const StakingSkeleton = () => {
  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30, flexWrap: "wrap" }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        <Stats loading />
        <Referenda loading />
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection loading />
      </div>
    </div>
  )
}

export const StakingData = () => {
  const { account } = useAccount()
  const staking = useStakeData()

  const showGuide = staking.data && !staking.data.stakePosition

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        {showGuide && <StakingGuide />}
        <Stats data={staking.data} loading={staking.isLoading} />
        <ReferendaWrapper />
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection data={staking.data} loading={staking.isLoading} />
        {account && staking.data?.positionId && <AvailableRewards />}
      </div>
    </div>
  )
}
