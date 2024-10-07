import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { Stats } from "./components/Stats/Stats"
import { OpenGovReferendas, Referenda } from "./components/Referenda/Referendas"
import { useStakeData } from "sections/staking/StakingPage.utils"
import { useRpcProvider } from "providers/rpcProvider"
import { useMedia } from "react-use"
import { theme } from "theme"

export const StakingDashboard = () => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <StakingSkeleton />

  return <StakingData />
}

export const StakingSkeleton = () => {
  const isDesktop = useMedia(theme.viewport.gte.sm)

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30, flexWrap: "wrap" }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        <Stats loading />
        {!isDesktop && <Referenda loading />}
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection loading />
        {isDesktop && <Referenda loading />}
      </div>
    </div>
  )
}

export const StakingData = () => {
  const { account } = useAccount()
  const staking = useStakeData()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const showGuide = staking.data && !staking.data.stakePosition

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        {showGuide && <StakingGuide />}
        {account && staking.data?.positionId && <AvailableRewards />}
        <Stats data={staking.data} loading={staking.isLoading} />
        {!isDesktop && <OpenGovReferendas />}
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection data={staking.data} loading={staking.isLoading} />
        {isDesktop && <OpenGovReferendas />}
      </div>
    </div>
  )
}
