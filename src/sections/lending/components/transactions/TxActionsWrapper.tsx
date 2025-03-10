import CheckIcon from "assets/icons/CheckIcon.svg?react"
import { Button } from "components/Button/Button"
import { Text } from "components/Typography/Text/Text"
import { useRpcProvider } from "providers/rpcProvider"
import { ReactNode } from "react"
import { ApprovalTooltip } from "sections/lending/components/infoTooltips/ApprovalTooltip"
import { TxStateType, useModalContext } from "sections/lending/hooks/useModal"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { TxAction } from "sections/lending/ui-config/errorMapping"

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
  tryPermit,
  className,
}: TxActionsWrapperProps) => {
  const { isLoaded } = useRpcProvider()
  const { txError } = useModalContext()
  const { readOnlyModeAddress } = useWeb3Context()
  const hasApprovalError =
    requiresApproval &&
    txError?.txAction === TxAction.APPROVAL &&
    txError?.actionBlocked
  const isAmountMissing =
    requiresAmount && requiresAmount && Number(amount) === 0

  function getMainParams() {
    if (!isLoaded)
      return { disabled: true, loading: true, content: <span>Loading...</span> }
    if (blocked) return { disabled: true, content: actionText }
    if (
      (txError?.txAction === TxAction.GAS_ESTIMATION ||
        txError?.txAction === TxAction.MAIN_ACTION) &&
      txError?.actionBlocked
    ) {
      if (errorParams) return errorParams
      return { loading: false, disabled: true, content: actionText }
    }
    if (isWrongNetwork)
      return { disabled: true, content: <span>Wrong Network</span> }
    if (fetchingData)
      return { disabled: true, content: <span>Fetching data...</span> }
    if (isAmountMissing)
      return { disabled: true, content: <span>Enter an amount</span> }
    if (preparingTransactions) return { disabled: true, loading: true }
    // if (hasApprovalError && handleRetry)
    //   return { content: <span>Retry with approval</span>, handleClick: handleRetry };
    if (mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText }
    if (requiresApproval && !approvalTxState?.success)
      return { disabled: true, content: actionText }
    return { content: actionText, handleClick: handleAction }
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
        disabled: true,
        content: (
          <>
            <span>Approve Confirmed</span>
            <CheckIcon />
          </>
        ),
      }

    return {
      content: (
        <>
          <span>Approve {symbol} to continue</span>
          <ApprovalTooltip />
        </>
      ),

      handleClick: handleApproval,
    }
  }

  const { content, disabled, loading, handleClick } = getMainParams()
  const approvalParams = getApprovalParams()
  return (
    <div sx={{ flex: "column", mt: ["auto", 16] }} className={className}>
      {approvalParams && !readOnlyModeAddress && (
        <Button
          variant="primary"
          isLoading={approvalParams.loading}
          disabled={approvalParams.disabled || blocked}
          onClick={() =>
            approvalParams.handleClick && approvalParams.handleClick()
          }
          size="medium"
          type="button"
        >
          {approvalParams.content}
        </Button>
      )}
      <Button
        variant="primary"
        disabled={disabled || blocked || readOnlyModeAddress !== undefined}
        onClick={() => handleClick?.()}
        size="medium"
        type="button"
        isLoading={loading}
        sx={approvalParams ? { mt: 8 } : undefined}
      >
        {content}
      </Button>
      {readOnlyModeAddress && (
        <Text fs={12} tAlign="center" color="basic400" sx={{ mt: 8 }}>
          <span>
            Read-only mode. Connect to a wallet to perform transactions.
          </span>
        </Text>
      )}
    </div>
  )
}
