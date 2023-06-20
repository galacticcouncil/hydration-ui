import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { StakingGuide } from "./components/StakingGuide/StakingGuide"
import { AvailableRewards } from "./components/AvailableRewards/AvailableRewards"
import { StakingInputSection } from "./components/StakingInputSection/StakingInputSection"
import { useAccountStore } from "state/store"
import { Stats } from "./components/Stats/Stats"

export const StakingDashboard = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null
  return <StakingData />
}

export const StakingData = () => {
  const { account } = useAccountStore()

  return (
    <div sx={{ flex: ["column-reverse", "row"], gap: 30 }}>
      <div sx={{ flex: "column", gap: 28 }} css={{ flex: 3 }}>
        <StakingGuide />
        <Stats isConnected={!!account} />
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
