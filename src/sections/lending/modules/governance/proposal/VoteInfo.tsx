import { VotingMachineProposalState } from "@aave/contract-helpers"

import { Box, Button, Paper, Typography } from "@mui/material"
import { constants } from "ethers"
import { formatUnits } from "ethers/lib/utils"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Row } from "sections/lending/components/primitives/Row"
import { Warning } from "sections/lending/components/primitives/Warning"
import { ConnectWalletButton } from "sections/lending/components/WalletConnection/ConnectWalletButton"
import { EnhancedProposal } from "sections/lending/hooks/governance/useProposal"
import { useVotingPowerAt } from "sections/lending/hooks/governance/useVotingPowerAt"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useRootStore } from "sections/lending/store/root"

import { networkConfigs } from "sections/lending/ui-config/networksConfig"

interface VoteInfoProps {
  proposal: EnhancedProposal
}

export function VoteInfo({ proposal }: VoteInfoProps) {
  const { openGovVote } = useModalContext()
  const user = useRootStore((state) => state.account)
  const voteOnProposal = proposal.votingMachineData.votedInfo
  const votingChainId = proposal.proposal.votingPortal.votingMachineChainId
  const network = networkConfigs[votingChainId]

  const blockHash =
    proposal.proposal.snapshotBlockHash === constants.HashZero
      ? "latest"
      : proposal.proposal.snapshotBlockHash

  const { data: powerAtProposalStart } = useVotingPowerAt(
    blockHash,
    proposal.votingMachineData.votingAssets,
  )

  const voteOngoing =
    proposal.votingMachineData.state === VotingMachineProposalState.Active

  const didVote = powerAtProposalStart && voteOnProposal?.votingPower !== "0"
  const showAlreadyVotedMsg = !!user && voteOnProposal && didVote

  const showCannotVoteMsg =
    !!user && voteOngoing && Number(powerAtProposalStart) === 0
  const showCanVoteMsg =
    powerAtProposalStart &&
    !didVote &&
    !!user &&
    voteOngoing &&
    Number(powerAtProposalStart) !== 0

  return (
    <Paper sx={{ px: 6, py: 4, mb: 8.5 }}>
      <Row
        sx={{ mb: 8 }}
        caption={
          <>
            <Typography variant="h3">
              <span>Your voting info</span>
            </Typography>
            {network && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  color: "text.secondary",
                }}
              >
                <Typography variant="caption">
                  <span>Voting is on</span>
                </Typography>
                <Box
                  sx={{
                    height: 16,
                    width: 16,
                    ml: 1,
                    mr: 1,
                    mb: 1,
                  }}
                >
                  <img
                    src={network.networkLogoPath}
                    alt="network logo"
                    style={{ height: "100%", width: "100%" }}
                  />
                </Box>
                <Typography variant="caption">
                  {network?.displayName}
                </Typography>
              </Box>
            )}
          </>
        }
      />
      {user ? (
        <>
          {user && !didVote && !voteOngoing && (
            <Typography sx={{ textAlign: "center" }} color="text.muted">
              <span>You did not participate in this proposal</span>
            </Typography>
          )}
          {user && voteOngoing && (
            <Row
              caption={
                <>
                  <Typography variant="description">
                    <span>Voting power</span>
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    (AAVE + stkAAVE)
                  </Typography>
                </>
              }
            >
              <FormattedNumber
                value={powerAtProposalStart || 0}
                variant="main16"
                visibleDecimals={2}
              />
            </Row>
          )}
          {showAlreadyVotedMsg && (
            <Warning
              severity={voteOnProposal.support ? "success" : "error"}
              sx={{ my: 8 }}
            >
              <Typography variant="subheader1">
                <span>You voted {voteOnProposal.support ? "YAE" : "NAY"}</span>
              </Typography>
              <Typography variant="caption">
                <span>
                  With a voting power of{" "}
                  <FormattedNumber
                    value={
                      formatUnits(
                        proposal.votingMachineData.votedInfo.votingPower,
                        18,
                      ) || 0
                    }
                    variant="caption"
                    visibleDecimals={2}
                  />
                </span>
              </Typography>
            </Warning>
          )}
          {showCannotVoteMsg && (
            <Warning severity="warning" sx={{ my: 8 }}>
              <span>
                Not enough voting power to participate in this proposal
              </span>
            </Warning>
          )}
          {showCanVoteMsg && (
            <>
              <Button
                color="success"
                variant="contained"
                fullWidth
                onClick={() =>
                  openGovVote(proposal, true, powerAtProposalStart)
                }
              >
                <span>Vote YAE</span>
              </Button>
              <Button
                color="error"
                variant="contained"
                fullWidth
                onClick={() =>
                  openGovVote(proposal, false, powerAtProposalStart)
                }
                sx={{ mt: 2 }}
              >
                <span>Vote NAY</span>
              </Button>
            </>
          )}
        </>
      ) : (
        <ConnectWalletButton />
      )}
    </Paper>
  )
}
