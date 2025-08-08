import { Box, Button, Spinner } from "@galacticcouncil/ui/components"
import { ReactNode } from "react"

import { TxStateType, useModalContext } from "@/hooks/useModal"
import { TxAction } from "@/ui-config/errorMapping"

interface TxActionsWrapperProps {
  actionInProgressText: ReactNode
  actionText: ReactNode
  amount?: string
  approvalTxState?: TxStateType
  handleAction: () => Promise<void>
  mainTxState: TxStateType
  preparingTransactions: boolean
  requiresAmount?: boolean
  requiresApproval?: boolean
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
  handleAction,
  mainTxState,
  preparingTransactions,
  requiresAmount,
  requiresApproval = false,
  blocked,
  fetchingData = false,
  errorParams,
  className,
}: TxActionsWrapperProps) => {
  const { txError } = useModalContext()

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
    if (mainTxState?.loading)
      return { loading: true, disabled: true, content: actionInProgressText }
    if (requiresApproval && !approvalTxState?.success)
      return { loading: false, disabled: true, content: actionText }
    return { loading: false, content: actionText, handleClick: handleAction }
  }

  const { loading, content, disabled, handleClick } = getMainParams()

  const isSubmitDisabled = loading || disabled || blocked

  return (
    <Box mt="var(--modal-content-padding)" className={className}>
      <Button
        variant={isSubmitDisabled ? "tertiary" : "primary"}
        width="100%"
        disabled={isSubmitDisabled}
        onClick={() => handleClick?.()}
        size="large"
        sx={{ position: "relative" }}
      >
        {loading && (
          <span
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <Spinner />
          </span>
        )}
        <span sx={{ opacity: loading ? 0 : 1 }}>{content || <>&nbsp;</>}</span>
      </Button>
    </Box>
  )
}
