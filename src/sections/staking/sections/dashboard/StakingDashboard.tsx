import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccountStore } from "state/store"
import { Stats } from "./components/Stats/Stats"
import { StakingAccountSkeleton } from "./components/StakingAccountsTable/skeleton/StakingAccountSkeleton"
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
        <StakingGuide />
        <Stats loading />
        <Referenda loading />
        <StakingAccountSkeleton />
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

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        {!staking.data?.stakePosition && <StakingGuide />}
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
