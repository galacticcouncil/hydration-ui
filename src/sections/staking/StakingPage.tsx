import { Page } from "components/Layout/Page/Page"
import { Spacer } from "components/Spacer/Spacer"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"

export const StakingPage = () => {
  return (
    <Page>
      <Spacer size={[20, 30]} />
      <StakingDashboard />
    </Page>
  )
}
