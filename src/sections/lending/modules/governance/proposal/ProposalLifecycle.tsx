import {
  Payload,
  PayloadState,
  ProposalV3State,
  VotingMachineProposalState,
} from "@aave/contract-helpers"
import { ExternalLinkIcon } from "@heroicons/react/outline"

import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  timelineItemClasses,
  TimelineSeparator,
} from "@mui/lab"
import { Button, Paper, SvgIcon, Typography, useTheme } from "@mui/material"
import dayjs from "dayjs"
import { ReactNode } from "react"
import { Link } from "sections/lending/components/primitives/Link"
import { EnhancedProposal } from "sections/lending/hooks/governance/useProposal"

enum ProposalLifecycleStep {
  Created,
  OpenForVoting,
  VotingClosed,
  PayloadsExecuted,
  Cancelled,
  Expired,
  Done,
}

export const ProposalLifecycle = ({
  proposal,
  payloads,
}: {
  proposal: EnhancedProposal | undefined
  payloads: Payload[] | undefined
}) => {
  if (payloads === undefined || proposal === undefined) {
    return <></> // TODO: skeleton
  }

  const proposalState = getLifecycleState(proposal, payloads)

  const votingClosedStepLabel = <span>Voting closed</span>
  // TODO: show if passed/failed
  // if (proposalState >= ProposalLifecycleStep.VotingClosed) {
  // proposal.votingMachineData.
  // votingClosedStepLabel = (
  //   <>
  //     <span>Voting closed</span>
  //     {'Passed'}
  //   </>
  // );
  // }

  const urlRegex = /https?:\/\/[^\s"]+/g
  const discussionUrl =
    proposal.proposal.proposalMetadata.discussions.match(urlRegex)

  return (
    <Paper sx={{ px: 6, py: 4, mb: 2.5 }}>
      <Typography variant="h3">
        <span>Proposal details</span>
      </Typography>
      <Timeline
        position="right"
        sx={{
          [`& .${timelineItemClasses.root}:before`]: {
            flex: 0,
            padding: 0,
          },
        }}
      >
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.Created}
          active={proposalState === ProposalLifecycleStep.Created}
          stepName={<span>Created</span>}
          timestamp={formatTime(
            +proposal.proposal.transactions.created.timestamp,
          )}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.OpenForVoting}
          active={proposalState === ProposalLifecycleStep.OpenForVoting}
          stepName={<span>Open for voting</span>}
          timestamp={formatTime(
            getOpenForVotingTimestamp(proposalState, proposal),
          )}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.VotingClosed}
          active={proposalState === ProposalLifecycleStep.VotingClosed}
          stepName={votingClosedStepLabel}
          timestamp={formatTime(
            getVotingClosedTimestamp(proposalState, proposal),
          )}
        />
        <ProposalStep
          completed={proposalState > ProposalLifecycleStep.PayloadsExecuted}
          active={proposalState === ProposalLifecycleStep.PayloadsExecuted}
          stepName={<span>Payloads executed</span>}
          timestamp={formatTime(
            getPayloadsExecutedTimestamp(proposalState, proposal, payloads),
          )}
          lastStep
        />
      </Timeline>
      {discussionUrl && (
        <Button
          component={Link}
          target="_blank"
          rel="noopener"
          href={discussionUrl[0]}
          variant="outlined"
          endIcon={
            <SvgIcon>
              <ExternalLinkIcon />
            </SvgIcon>
          }
        >
          <span>Forum discussion</span>
        </Button>
      )}
    </Paper>
  )
}

const getLifecycleState = (proposal: EnhancedProposal, payloads: Payload[]) => {
  if (proposal.proposal.state === ProposalV3State.Created) {
    return ProposalLifecycleStep.Created
  }

  if (proposal.proposal.state === ProposalV3State.Active) {
    return ProposalLifecycleStep.OpenForVoting
  }

  if (
    proposal.votingMachineData.state === VotingMachineProposalState.Finished ||
    proposal.proposal.state === ProposalV3State.Queued
  ) {
    return ProposalLifecycleStep.VotingClosed
  }

  if (proposal.proposal.state === ProposalV3State.Executed) {
    const payloadsExecuted = payloads.every(
      (payload) => payload.state === PayloadState.Executed,
    )
    if (payloadsExecuted) {
      return ProposalLifecycleStep.Done
    } else {
      return ProposalLifecycleStep.PayloadsExecuted
    }
  }

  if (proposal.proposal.state === ProposalV3State.Cancelled) {
    return ProposalLifecycleStep.Cancelled
  }

  if (proposal.proposal.state === ProposalV3State.Expired) {
    return ProposalLifecycleStep.Expired
  }

  return ProposalLifecycleStep.Done
}

const getOpenForVotingTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
) => {
  const votingMachineStartTime =
    proposal.votingMachineData.proposalData.startTime
  if (
    currentState === ProposalLifecycleStep.Created ||
    votingMachineStartTime === 0
  ) {
    const creationTime = +proposal.proposal.transactions.created.timestamp
    const votingStartDelay =
      proposal.proposal.votingConfig.cooldownBeforeVotingStart
    return creationTime + Number(votingStartDelay)
  }

  return proposal.votingMachineData.proposalData.startTime
}

const getVotingClosedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
) => {
  const votingMachineEndTime = proposal.votingMachineData.proposalData.endTime
  if (
    currentState === ProposalLifecycleStep.Created ||
    votingMachineEndTime === 0
  ) {
    const votingDuration = proposal.proposal.votingConfig.votingDuration
    return (
      getOpenForVotingTimestamp(currentState, proposal) + Number(votingDuration)
    )
  }

  return proposal.votingMachineData.proposalData.endTime
}

const getPayloadsExecutedTimestamp = (
  currentState: ProposalLifecycleStep,
  proposal: EnhancedProposal,
  payloads: Payload[],
) => {
  const executedAt = payloads.map((p) => p.executedAt).sort((a, b) => b - a)[0]
  if (currentState === ProposalLifecycleStep.Created || executedAt === 0) {
    const executionDelay = payloads[0].delay
    return (
      getVotingClosedTimestamp(currentState, proposal) + Number(executionDelay)
    )
  }

  return executedAt
}

const formatTime = (timestamp: number) => {
  return dayjs.unix(timestamp).format("MMM D, YYYY h:mm A")
}

const ProposalStep = ({
  stepName,
  timestamp,
  lastStep,
  completed,
  active,
}: {
  stepName: ReactNode
  timestamp: string
  lastStep?: boolean
  completed?: boolean
  active?: boolean
}) => {
  const theme = useTheme()

  return (
    <TimelineItem>
      <TimelineSeparator>
        <TimelineDot
          sx={{
            background: completed
              ? theme.palette.primary.main
              : active
              ? "unset"
              : theme.palette.text.disabled,
            borderColor:
              completed || active
                ? theme.palette.primary.main
                : theme.palette.text.disabled,
            my: 1,
          }}
          variant={active ? "outlined" : "filled"}
        />
        {!lastStep && (
          <TimelineConnector
            sx={{
              background: completed
                ? theme.palette.primary.main
                : theme.palette.text.disabled,
            }}
          />
        )}
      </TimelineSeparator>
      <TimelineContent>
        <Typography sx={{ mt: -1.5 }} variant="main14">
          {stepName}
        </Typography>
        <Typography variant="tooltip" color="text.muted">
          {timestamp}
        </Typography>
      </TimelineContent>
    </TimelineItem>
  )
}
