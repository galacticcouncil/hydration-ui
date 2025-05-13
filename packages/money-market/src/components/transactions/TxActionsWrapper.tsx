import { Check } from "@galacticcouncil/ui/assets/icons"
import { Button, Text } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

import { TxStateType, useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { TxAction } from "@/ui-config/errorMapping"

interface TxActionsWrapperProps {
  actionInProgressText: ReactNode
  actionText: ReactNode
  amount?: string
  approvalTxState?: TxStateType
  handleApproval?: () => Promise<void>
  handleAction: () => Promise<void>
  isWrongNetwork: boolean
  mainTxState: TxStateType
  preparingTransactions: boolean
  requiresAmount?: boolean
  requiresApproval: boolean
  symbol?: string
  blocked?: boolean
  fetchingData?: boolean
  errorParams?: {
    loading: boolean
    disabled: boolean
    content: ReactNode
    handleClick: () => Promise<void>
  }
  tryPermit?: boolean
  className?: string
}

export const TxActionsWrapper = ({
  actionInProgressText,
  actionText,
  amount,
  approvalTxState,
  handleApproval,
  handleAction,
  isWrongNetwork,
  mainTxState,
  preparingTransactions,
  requiresAmount,
  requiresApproval,
  symbol,
  blocked,
  fetchingData = false,
  errorParams,
  className,
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext()
  const { readOnlyModeAddress } = useWeb3Context()
  const hasApprovalError =
    requiresApproval &&
    txError?.txAction === TxAction.APPROVAL &&
    txError?.actionBlocked
  const isAmountMissing =
    requiresAmount && requiresAmount && Number(amount) === 0

  function getMainParams() {
    if (blocked) return { loading: false, disabled: true, content: actionText }
    if (
      (txError?.txAction === TxAction.GAS_ESTIMATION ||
        txError?.txAction === TxAction.MAIN_ACTION) &&
      txError?.actionBlocked
    ) {
      if (errorParams) return errorParams
      return { loading: false, disabled: true, content: actionText }
    }
    if (isWrongNetwork)
      return {
        loading: false,
        disabled: true,
        content: <span>Wrong Network</span>,
      }
    if (fetchingData)
      return {
        loading: false,
        disabled: true,
        content: <span>Fetching data...</span>,
      }
    if (isAmountMissing)
      return {
        loading: false,
        disabled: true,
        content: <span>Enter an amount</span>,
      }
    if (preparingTransactions) return { loading: true, disabled: true }
    // if (hasApprovalError && handleRetry)
    //   return { content: <span>Retry with approval</span>, handleClick: handleRetry };
    if (mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText }
    if (requiresApproval && !approvalTxState?.success)
      return { loading: false, disabled: true, content: actionText }
    return { loading: false, content: actionText, handleClick: handleAction }
  }

  function getApprovalParams() {
    if (
      !requiresApproval ||
      isWrongNetwork ||
      isAmountMissing ||
      preparingTransactions ||
      hasApprovalError
    )
      return null
    if (approvalTxState?.loading)
      return {
        loading: true,
        disabled: true,
        content: <span>Approving {symbol}...</span>,
      }
    if (approvalTxState?.success)
      return {
        loading: false,
        disabled: true,
        content: (
          <>
            <span>Approve Confirmed</span>
            <Check />
          </>
        ),
      }

    return {
      loading: false,
      content: (
        <>
          <span>Approve {symbol} to continue</span>
        </>
      ),

      handleClick: handleApproval,
    }
  }

  const { content, disabled, handleClick } = getMainParams()
  const approvalParams = getApprovalParams()
  const isSubmitDisabled =
    disabled || blocked || readOnlyModeAddress !== undefined

  return (
    <div sx={{ flex: "column", mt: ["auto", 16] }} className={className}>
      {approvalParams && !readOnlyModeAddress && (
        <Button
          variant="primary"
          disabled={approvalParams.disabled || blocked}
          onClick={() =>
            approvalParams.handleClick && approvalParams.handleClick()
          }
          size="medium"
        >
          {approvalParams.content}
        </Button>
      )}
      <Button
        variant={isSubmitDisabled ? "tertiary" : "primary"}
        width="100%"
        disabled={isSubmitDisabled}
        onClick={() => handleClick?.()}
        size="large"
        sx={approvalParams ? { mt: 8 } : undefined}
      >
        {content}
      </Button>
      {readOnlyModeAddress && (
        <Text fs={12} align="center">
          <span>
            Read-only mode. Connect to a wallet to perform transactions.
          </span>
        </Text>
      )}
    </div>
  )
}
