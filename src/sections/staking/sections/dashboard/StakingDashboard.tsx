import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccountStore } from "state/store"
import { Stats } from "./components/Stats/Stats"
import { StakingAccountsTableWrapperData } from "./components/StakingAccountsTable/StakingAcoountsTableWrapper"
import { StakingAccountSkeleton } from "./components/StakingAccountsTable/skeleton/StakingAccountSkeleton"
import { Referenda, ReferendaWrapper } from "./components/Referenda/Referenda"
import { useStakingData } from "api/staking"

export const StakingDashboard = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <StakingSkeleton />

  return <StakingData />
}

export const StakingData = () => {
  const { account } = useAccountStore()
  const staking = useStakingData()
  console.log(staking)
  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        {!staking.data?.stakePosition && <StakingGuide />}
        <Stats data={staking.data} loading={staking.isLoading} />
        <ReferendaWrapper />
        <StakingAccountsTableWrapperData />
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection data={staking.data} loading={staking.isLoading} />
        {account && staking.data?.positionId && (
          <AvailableRewards positionId={staking.data.positionId} />
        )}
      </div>
    </div>
  )
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
