import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccountStore } from "state/store"
import { Stats } from "./components/Stats/Stats"
import { Referenda, ReferendaWrapper } from "./components/Referenda/Referenda"
import { useStakeData } from "sections/staking/StakingPage.utils"

export const StakingDashboard = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <StakingSkeleton />

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
  const { account } = useAccountStore()
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
        {<AvailableRewards />}
      </div>
    </div>
  )
}
