import { InterestRate, ProtocolAction } from "@aave/contract-helpers"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"
import { useEffect } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { usePoolApprovedAmount } from "@/hooks/useApprovedAmount"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { queryKeysFactory } from "@/ui-config/queries"

export interface RepayActionProps {
  amountToRepay: string
  poolReserve: ComputedReserveData
  isWrongNetwork: boolean
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
  poolReserve,
  poolAddress,
  isWrongNetwork,
  symbol,
  debtType,
  repayWithATokens,
  blocked,
  className,
}: RepayActionProps) => {
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

  const action = async () => {
    try {
      setMainTxState({ ...mainTxState, loading: true })

      const action = ProtocolAction.repay

      const repayParams = {
        amountToRepay:
          amountToRepay === "-1"
            ? amountToRepay
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
      repayTxData = await estimateGasLimit(repayTxData)
      await sendTx(repayTxData, action)

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
      isWrongNetwork={isWrongNetwork}
      className={className}
      handleAction={action}
      actionText={<span>Repay {symbol}</span>}
      actionInProgressText={<span>Repaying {symbol}</span>}
    />
  )
}
