import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useModalContext } from "@/hooks/useModal"

export interface SwapActionProps {
  amountToSwap: string
  blocked: boolean
  loading?: boolean
  className?: string
  submitTxFn: () => Promise<void>
}

export const SwapActions = ({
  amountToSwap,
  blocked,
  loading,
  submitTxFn,
  className,
}: SwapActionProps) => {
  const { mainTxState, setMainTxState, close } = useModalContext()

  const handleAction = async () => {
    setMainTxState({ loading: true })
    try {
      // Builds the native aToken -> aToken router trade and opens the standard
      // sign/submit modal.
      await submitTxFn()
    } catch (error) {
      console.error(error)
      setMainTxState({ loading: false })
    } finally {
      close()
    }
  }

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      preparingTransactions={false}
      handleAction={handleAction}
      requiresAmount
      amount={amountToSwap}
      blocked={blocked}
      actionText={<span>Swap</span>}
      actionInProgressText={<span>Swapping</span>}
      fetchingData={loading}
      className={className}
    />
  )
}
