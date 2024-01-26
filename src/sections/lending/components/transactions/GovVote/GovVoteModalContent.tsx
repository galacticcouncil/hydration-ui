import { Box, Button, Typography, useTheme } from "@mui/material"
import { EnhancedProposal } from "sections/lending/hooks/governance/useProposal"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { getNetworkConfig } from "sections/lending/utils/marketsAndNetworksConfig"

import { LensIcon } from "sections/lending/components/icons/LensIcon"
import { TxErrorView } from "sections/lending/components/transactions/FlowCommons/Error"
import { GasEstimationError } from "sections/lending/components/transactions/FlowCommons/GasEstimationError"
import { TxSuccessView } from "sections/lending/components/transactions/FlowCommons/Success"
import {
  DetailsNumberLine,
  TxModalDetails,
} from "sections/lending/components/transactions/FlowCommons/TxModalDetails"
import { TxModalTitle } from "sections/lending/components/transactions/FlowCommons/TxModalTitle"
import { ChangeNetworkWarning } from "sections/lending/components/transactions/Warnings/ChangeNetworkWarning"
import { GovVoteActions } from "./GovVoteActions"

export type GovVoteModalContentProps = {
  proposal: EnhancedProposal
  support: boolean
  power: string
}

export interface Asset {
  symbol: string
  icon: string
  value: number
  address: string
}

export enum ErrorType {
  NOT_ENOUGH_VOTING_POWER,
}

export const GovVoteModalContent = ({
  proposal,
  support,
  power: votingPower,
}: GovVoteModalContentProps) => {
  const { chainId: connectedChainId, readOnlyModeAddress } = useWeb3Context()
  const { gasLimit, mainTxState: txState, txError } = useModalContext()
  const { palette } = useTheme()
  // handle delegate address errors
  let blockingError: ErrorType | undefined = undefined
  if (votingPower === "0") {
    blockingError = ErrorType.NOT_ENOUGH_VOTING_POWER
  }
  // render error messages
  const handleBlocked = () => {
    switch (blockingError) {
      case ErrorType.NOT_ENOUGH_VOTING_POWER:
        return (
          // TODO: fix text
          <Typography>
            <span>No voting power</span>
          </Typography>
        )
      default:
        return null
    }
  }

  const proposalVotingChain =
    +proposal.proposal.votingPortal.votingMachineChainId

  const isWrongNetwork = connectedChainId !== proposalVotingChain

  const networkConfig = getNetworkConfig(proposalVotingChain)

  if (txError && txError.blocking) {
    return <TxErrorView txError={txError} />
  }

  if (txState.success)
    return (
      <TxSuccessView
        customAction={
          <Box mt={5}>
            <Button
              component="a"
              target="_blank"
              rel="noopener noreferrer"
              href={`https://hey.xyz/?url=${
                window.location.href
              }&text=${`I just voted on the latest active proposal on aave governance`}&hashtags=Aave&preview=true`}
              startIcon={
                <LensIcon
                  color={
                    palette.mode === "dark"
                      ? palette.primary.light
                      : palette.text.primary
                  }
                />
              }
            >
              <span>Share on Lens</span>
            </Button>
          </Box>
        }
        customText={<span>Thank you for voting!!</span>}
      />
    )

  return (
    <>
      <TxModalTitle title="Governance vote" />
      {isWrongNetwork && !readOnlyModeAddress && (
        <ChangeNetworkWarning
          networkName={networkConfig.name}
          chainId={proposalVotingChain}
        />
      )}
      {blockingError !== undefined && (
        <Typography variant="helperText" color="red">
          {handleBlocked()}
        </Typography>
      )}
      <TxModalDetails gasLimit={gasLimit} chainId={proposalVotingChain}>
        <DetailsNumberLine
          description={<span>Voting power</span>}
          value={votingPower}
        />
      </TxModalDetails>

      {txError && <GasEstimationError txError={txError} />}

      <GovVoteActions
        proposal={proposal}
        support={support}
        isWrongNetwork={isWrongNetwork}
        blocked={blockingError !== undefined}
      />
    </>
  )
}
