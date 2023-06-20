import { LINKS } from "utils/navigation"
import { ReactComponent as StakingIcon } from "assets/icons/StakingIcon.svg"
import { ReactComponent as GovernanceIcon } from "assets/icons/GovernanceIcon.svg"

export const STAKING_TABS = [
  { id: "dashboard", link: LINKS.stakingDashboard, icon: <StakingIcon /> },
  { id: "governance", link: LINKS.stakingGovernance, icon: <GovernanceIcon /> },
] as const
