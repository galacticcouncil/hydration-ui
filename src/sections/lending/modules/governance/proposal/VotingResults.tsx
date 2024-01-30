import { Box, Paper, Skeleton, Typography } from "@mui/material"
import { CheckBadge } from "sections/lending/components/primitives/CheckBadge"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Row } from "sections/lending/components/primitives/Row"
import { EnhancedProposal } from "sections/lending/hooks/governance/useProposal"
import { ProposalVotes } from "sections/lending/hooks/governance/useProposalVotes"

import { StateBadge } from "sections/lending/modules/governance/StateBadge"
import { getProposalVoteInfo } from "sections/lending/modules/governance/utils/formatProposal"
import { VoteBar } from "sections/lending/modules/governance/VoteBar"
import { VotersListContainer } from "./VotersListContainer"

interface VotingResultsPros {
  proposal?: EnhancedProposal
  proposalVotes?: ProposalVotes
  loading: boolean
}

export const VotingResults = ({
  proposal,
  loading,
  proposalVotes,
}: VotingResultsPros) => {
  const voteInfo = proposal
    ? getProposalVoteInfo(proposal?.proposal)
    : undefined
  return (
    <Paper sx={{ px: 6, py: 4, mb: 8.5 }}>
      <Typography variant="h3">
        <span>Voting results</span>
      </Typography>
      {proposal && voteInfo ? (
        <>
          <VoteBar
            yae
            percent={voteInfo.forPercent}
            votes={voteInfo.forVotes}
            sx={{ mt: 8 }}
            loading={loading}
          />
          <VoteBar
            percent={voteInfo.againstPercent}
            votes={voteInfo.againstVotes}
            sx={{ mt: 12 }}
            loading={loading}
          />
          {proposalVotes && (
            <VotersListContainer
              proposal={voteInfo}
              proposalVotes={proposalVotes}
            />
          )}
          <Row
            caption={<span>State</span>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <StateBadge state={proposal.proposal.state} loading={loading} />
              {/*
              <Box sx={{ mt: 0.5 }}>
                <FormattedProposalTime
                  state={proposal.proposalState}
                  startTimestamp={proposal.startTimestamp}
                  executionTime={proposal.executionTime}
                  expirationTimestamp={proposal.expirationTimestamp}
                  executionTimeWithGracePeriod={proposal.executionTimeWithGracePeriod}
                />
              </Box>
              */}
            </Box>
          </Row>
          <Row
            caption={<span>Quorum</span>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <CheckBadge
              loading={loading}
              text={
                voteInfo.quorumReached ? (
                  <span>Reached</span>
                ) : (
                  <span>Not reached</span>
                )
              }
              checked={voteInfo.quorumReached}
              sx={{ height: 48 }}
              variant="description"
            />
          </Row>
          <Row
            caption={
              <>
                <span>Current votes</span>
                <Typography variant="caption" color="text.muted">
                  Required
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: "right" }}>
              <FormattedNumber
                value={voteInfo.forVotes}
                visibleDecimals={2}
                roundDown
                sx={{ display: "block" }}
              />

              <FormattedNumber
                variant="caption"
                value={voteInfo.quorum}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
          <Row
            caption={<span>Differential</span>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <CheckBadge
              loading={loading}
              text={
                voteInfo.differentialReached ? (
                  <span>Reached</span>
                ) : (
                  <span>Not reached</span>
                )
              }
              checked={voteInfo.differentialReached}
              sx={{ height: 48 }}
              variant="description"
            />
          </Row>
          <Row
            caption={
              <>
                <span>Current differential</span>
                <Typography variant="caption" color="text.muted">
                  Required
                </Typography>
              </>
            }
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <Box sx={{ textAlign: "right" }}>
              <FormattedNumber
                value={voteInfo.currentDifferential}
                visibleDecimals={2}
                roundDown
                sx={{ display: "block" }}
              />
              <FormattedNumber
                variant="caption"
                value={voteInfo.requiredDifferential}
                visibleDecimals={2}
                roundDown
                color="text.muted"
              />
            </Box>
          </Row>
          {/*
          <Row
            caption={<span>Total voting power</span>}
            sx={{ height: 48 }}
            captionVariant="description"
          >
            <FormattedNumber
              value={normalize(proposal.totalVotingSupply, 18)}
              visibleDecimals={0}
              compact={false}
            />
          </Row>
*/}
        </>
      ) : (
        <>
          <Skeleton height={28} sx={{ mt: 8 }} />
          <Skeleton height={28} sx={{ mt: 8 }} />
        </>
      )}
    </Paper>
  )
}
