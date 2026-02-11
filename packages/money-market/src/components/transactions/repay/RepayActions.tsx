import { InterestRate, ProtocolAction } from "@aave/contract-helpers"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"
import { useEffect } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useProtocolActionToasts } from "@/hooks"
import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { usePoolApprovedAmount } from "@/hooks/useApprovedAmount"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { queryKeysFactory } from "@/ui-config/queries"

export interface RepayActionProps {
  amountToRepay: string
  amountToRepayMax: string
  isMaxSelected: boolean
  poolReserve: ComputedReserveData
  customGasPrice?: string
  poolAddress: string
  symbol: string
  debtType: InterestRate
  repayWithATokens: boolean
  blocked?: boolean
  maxApproveNeeded: string
  className?: string
}

export const RepayActions = ({
  amountToRepay,
  amountToRepayMax,
  isMaxSelected,
  poolReserve,
  poolAddress,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  className,
}: RepayActionProps) => {
  const { formatCurrency } = useAppFormatters()
  const queryClient = useQueryClient()
  const [
    repay,
    encodeRepayParams,
    estimateGasLimit,
    optimizedPath,
    currentMarketData,
  ] = useRootStore((store) => [
    store.repay,
    store.encodeRepayParams,
    store.estimateGasLimit,
    store.useOptimizedPath,
    store.currentMarketData,
  ])
  const { sendTx } = useWeb3Context()
  const { refetchGhoData, refetchIncentiveData, refetchPoolData } =
    useBackgroundDataProvider()

  const {
    approvalTxState,
    mainTxState,
    loadingTxns,
    setMainTxState,
    setTxError,
    setLoadingTxns,
    close,
  } = useModalContext()

  const {
    data: approvedAmount,
    refetch: fetchApprovedAmount,
    isFetching: fetchingApprovedAmount,
    isFetchedAfterMount,
  } = usePoolApprovedAmount(currentMarketData, poolAddress)

  setLoadingTxns(fetchingApprovedAmount)

  useEffect(() => {
    if (!isFetchedAfterMount && !repayWithATokens) {
      fetchApprovedAmount()
    }
  }, [fetchApprovedAmount, isFetchedAfterMount, repayWithATokens])

  const protocolAction = ProtocolAction.repay
  const toasts = useProtocolActionToasts(protocolAction, {
    value: formatCurrency(amountToRepay || "0", { symbol }),
  })

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true })

      const repayParams = {
        amountToRepay:
          amountToRepayMax === "-1"
            ? amountToRepayMax
            : isMaxSelected
              ? parseUnits(amountToRepayMax, poolReserve.decimals).toString()
              : parseUnits(amountToRepay, poolReserve.decimals).toString(),
        poolAddress,
        repayWithATokens,
        debtType,
      }

      let encodedParams: string | undefined
      if (optimizedPath()) {
        encodedParams = await encodeRepayParams(repayParams)
      }

      let repayTxData = repay({
        ...repayParams,
        encodedTxData: encodedParams,
      })
      repayTxData = await estimateGasLimit(repayTxData, protocolAction)
      await sendTx(repayTxData, toasts, protocolAction)

      queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
      refetchPoolData && refetchPoolData()
      refetchIncentiveData && refetchIncentiveData()
      refetchGhoData && refetchGhoData()
    } catch (error) {
      const parsedError = getErrorTextFromError(
        error as Error,
        TxAction.GAS_ESTIMATION,
        false,
      )
      setTxError(parsedError)
      setMainTxState({
        txHash: undefined,
        loading: false,
      })
    } finally {
      close()
    }
  }

  return (
    <TxActionsWrapper
      blocked={blocked}
      preparingTransactions={loadingTxns || !approvedAmount}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      requiresAmount
      amount={amountToRepay}
      className={className}
      handleAction={action}
      actionText={<span>Repay {symbol}</span>}
      actionInProgressText={<span>Repaying {symbol}</span>}
    />
  )
}
