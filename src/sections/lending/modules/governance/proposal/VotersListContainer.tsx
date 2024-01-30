import {
  Box,
  Button,
  CircularProgress,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material"
import { useState } from "react"
import { Row } from "sections/lending/components/primitives/Row"
import { ProposalVotes } from "sections/lending/hooks/governance/useProposalVotes"

import { ProposalVoteInfo } from "sections/lending/modules/governance/utils/formatProposal"
import { VotersList } from "./VotersList"
import { VotersListModal } from "./VotersListModal"

type VotersListProps = {
  proposal: ProposalVoteInfo
  proposalVotes: ProposalVotes
}

export type GovernanceVoter = {
  address: string
  ensName: string | null
  votingPower: number
  twitterAvatar: string | null
  support: boolean
}

export type VotersData = {
  yaes: GovernanceVoter[]
  nays: GovernanceVoter[]
  combined: GovernanceVoter[]
}

export const VotersListContainer = ({
  proposal,
  proposalVotes,
}: VotersListProps): JSX.Element => {
  const [votersModalOpen, setVotersModalOpen] = useState(false)
  const { breakpoints } = useTheme()
  const mdScreen = useMediaQuery(breakpoints.only("md"))

  const handleOpenAllVotes = () => {
    setVotersModalOpen(true)
  }

  if (false)
    return (
      <Box sx={{ mt: 8, mb: 162 }}>
        <Row sx={{ mb: 12 }}>
          <Typography
            sx={{ ml: "auto" }}
            variant="subheader2"
            color="text.secondary"
          >
            <span>Votes</span>
          </Typography>
        </Row>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={24} sx={{ my: 16 }} />
        </Box>
      </Box>
    )

  if (false)
    return (
      <Box sx={{ mt: 8, mb: 162 }}>
        <Row sx={{ mb: 12 }}>
          <Typography
            sx={{ ml: "auto" }}
            variant="subheader2"
            color="text.secondary"
          >
            <span>Votes</span>
          </Typography>
        </Row>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            mt: 8,
          }}
        >
          <Typography variant="helperText" color="error.main">
            <span>
              Failed to load proposal voters. Please refresh the page.
            </span>
          </Typography>
        </Box>
      </Box>
    )

  if (!proposalVotes || proposalVotes.combinedVotes.length === 0)
    return <Box sx={{ mt: 8 }} />

  return (
    <Box sx={{ my: 8 }}>
      <Row sx={{ mb: 12 }}>
        <Typography variant="subheader2" color="text.secondary">
          {proposalVotes.combinedVotes.length > 10 ? (
            <span>Top 10 addresses</span>
          ) : (
            <span>Addresses</span>
          )}
        </Typography>
        <Typography variant="subheader2" color="text.secondary">
          <span>Votes</span>
        </Typography>
      </Row>
      <VotersList
        compact={mdScreen}
        voters={proposalVotes.combinedVotes.slice(0, 10)}
        sx={{ my: 4, pr: 2.25 }}
      />
      {proposalVotes.combinedVotes.length > 10 && (
        <Button variant="outlined" fullWidth onClick={handleOpenAllVotes}>
          <span>View all votes</span>
        </Button>
      )}
      {votersModalOpen && (
        <VotersListModal
          open={votersModalOpen}
          close={() => setVotersModalOpen(false)}
          proposal={proposal}
          voters={proposalVotes}
        />
      )}
    </Box>
  )
}
