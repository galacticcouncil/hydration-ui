import { Box, Grid, Typography, useMediaQuery, useTheme } from "@mui/material"
import { useState } from "react"
import { Row } from "sections/lending/components/primitives/Row"
import StyledToggleButton from "sections/lending/components/StyledToggleButton"
import StyledToggleButtonGroup from "sections/lending/components/StyledToggleButtonGroup"
import { ProposalVotes } from "sections/lending/hooks/governance/useProposalVotes"

import { BasicModal } from "sections/lending/components/primitives/BasicModal"
import { ProposalVoteInfo } from "sections/lending/modules/governance/utils/formatProposal"
import { VoteBar } from "sections/lending/modules/governance/VoteBar"
import { VotersList } from "./VotersList"

type VotersListModalProps = {
  open: boolean
  close: () => void
  proposal: ProposalVoteInfo
  voters: ProposalVotes
}

export const VotersListModal = ({
  open,
  close,
  proposal,
  voters,
}: VotersListModalProps): JSX.Element | null => {
  const { breakpoints } = useTheme()
  const mdUp = useMediaQuery(breakpoints.up("md"))
  const [voteView, setVoteView] = useState<"yaes" | "nays">("yaes")
  const borderBaseStyle = {
    border: "1px solid",
    borderColor: "divider",
    borderRadius: 1,
  }

  if (!proposal || !voters) return null

  const yesVotesUI = (
    <>
      <VoteBar
        yae
        percent={proposal.forPercent}
        votes={proposal.forPercent}
        sx={{
          ...borderBaseStyle,
          px: 4,
          py: 2,
        }}
      />
      <Box sx={{ ...borderBaseStyle, mt: 3 }}>
        <Row
          sx={{
            px: 4,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subheader2" color="text.secondary">
            <span>Addresses ({voters.yaeVotes.length})</span>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <span>Votes</span>
          </Typography>
        </Row>
        <VotersList
          voters={voters.yaeVotes}
          sx={{
            p: 4,
            mb: 0,
            maxHeight: 318,
          }}
        />
      </Box>
    </>
  )

  const noVotesUI = (
    <>
      <VoteBar
        percent={proposal.againstPercent}
        votes={proposal.againstPercent}
        sx={{
          ...borderBaseStyle,
          px: 4,
          py: 2,
        }}
      />
      <Box sx={{ ...borderBaseStyle, mt: 3 }}>
        <Row
          sx={{
            px: 4,
            py: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="subheader2" color="text.secondary">
            <span>Addresses ({voters.nayVotes.length})</span>
          </Typography>
          <Typography variant="subheader2" color="text.secondary">
            <span>Votes</span>
          </Typography>
        </Row>
        <VotersList
          voters={voters.nayVotes}
          sx={{
            p: 4,
            mb: 0,
            maxHeight: 318,
          }}
        />
      </Box>
    </>
  )

  return (
    <BasicModal open={open} setOpen={close} contentMaxWidth={mdUp ? 800 : 360}>
      <Typography variant="h2">
        <span>Votes</span>
      </Typography>
      {mdUp ? (
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={6}>
            {yesVotesUI}
          </Grid>
          <Grid item xs={6}>
            {noVotesUI}
          </Grid>
        </Grid>
      ) : (
        <>
          <StyledToggleButtonGroup
            color="primary"
            value={voteView}
            exclusive
            onChange={(_, value) => setVoteView(value)}
            sx={{ width: "100%", height: "44px", mt: 8, mb: 6 }}
          >
            <StyledToggleButton value="yaes" disabled={voteView === "yaes"}>
              <Typography variant="subheader1">
                <span>Voted YAE</span>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="nays" disabled={voteView === "nays"}>
              <Typography variant="subheader1">
                <span>Voted NAY</span>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
          {voteView === "yaes" && yesVotesUI}
          {voteView === "nays" && noVotesUI}
        </>
      )}
    </BasicModal>
  )
}
