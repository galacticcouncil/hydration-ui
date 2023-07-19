import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccountStore } from "state/store"
import { Stats } from "./components/Stats/Stats"
import { StakingAccountsTableWrapperData } from "./components/StakingAccountsTable/StakingAcoountsTableWrapper"
import { StakingAccountSkeleton } from "./components/StakingAccountsTable/skeleton/StakingAccountSkeleton"
import { Rerefenrenda } from "./components/Referenda/Referenda"

export const StakingDashboard = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <StakingSkeleton />

  return <StakingData />
}

export const StakingData = () => {
  const { account } = useAccountStore()

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        <StakingGuide />
        <Stats isConnected={!!account} />
        <Rerefenrenda />
        <StakingAccountsTableWrapperData />
      </div>

      <div
        sx={{ flex: ["column-reverse", "column"], gap: 28 }}
        css={{ flex: 2 }}
      >
        <StakingInputSection />
        {account && <AvailableRewards />}
      </div>
    </div>
  )
}

export const StakingSkeleton = () => {
  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30, flexWrap: "wrap" }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        <StakingGuide />
        <Stats isConnected={false} loading />
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
