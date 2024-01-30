import { Paper, Typography } from "@mui/material"
import { ConnectWalletButton } from "sections/lending/components/WalletConnection/ConnectWalletButton"
import { useRootStore } from "sections/lending/store/root"

import { DelegatedInfoPanel } from "./DelegatedInfoPanel"
import { RepresentativesInfoPanel } from "./RepresentativesInfoPanel"
import { VotingPowerInfoPanel } from "./VotingPowerInfoPanel"

export const UserGovernanceInfo = () => {
  const account = useRootStore((state) => state.account)

  return account ? (
    <>
      <VotingPowerInfoPanel />
      <DelegatedInfoPanel />
      <RepresentativesInfoPanel />
    </>
  ) : (
    <Paper sx={{ p: 6 }}>
      <Typography variant="h3" sx={{ mb: { xs: 6, xsm: 10 } }}>
        <span>Your info</span>
      </Typography>
      <Typography sx={{ mb: 24 }} color="text.secondary">
        <span>
          Please connect a wallet to view your personal information here.
        </span>
      </Typography>
      <ConnectWalletButton funnel="Governance Page" />
    </Paper>
  )
}
