import { Spacer } from "components/Spacer/Spacer"
import { StakingDashboard } from "./sections/dashboard/StakingDashboard"

export const StakingPage = () => {
  return (
    <>
      <Spacer size={[20, 30]} />
      <StakingDashboard />
    </>
  )
}
