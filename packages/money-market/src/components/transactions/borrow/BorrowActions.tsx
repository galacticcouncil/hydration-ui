import { InterestRate, ProtocolAction } from "@aave/contract-helpers"
import { useQueryClient } from "@tanstack/react-query"
import { parseUnits } from "ethers/lib/utils"
import React, { useEffect } from "react"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useBackgroundDataProvider } from "@/hooks/app-data-provider/BackgroundDataProvider"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useModalContext } from "@/hooks/useModal"
import { useWeb3Context } from "@/libs/hooks/useWeb3Context"
import { useRootStore } from "@/store/root"
import { getErrorTextFromError, TxAction } from "@/ui-config/errorMapping"
import { gasLimitRecommendations } from "@/ui-config/gasLimit"
import { queryKeysFactory } from "@/ui-config/queries"

export interface BorrowActionsProps {
  poolReserve: ComputedReserveData
  amountToBorrow: string
  poolAddress: string
  interestRateMode: InterestRate
  isWrongNetwork: boolean
  symbol: string
  blocked: boolean
  className?: string
}

export const BorrowActions = React.memo(
  ({
    symbol,
    poolReserve,
    amountToBorrow,
    poolAddress,
    interestRateMode,
    isWrongNetwork,
    blocked,
    className,
  }: BorrowActionsProps) => {
    const queryClient = useQueryClient()
    const [borrow, estimateGasLimit] = useRootStore((state) => [
      state.borrow,
      state.estimateGasLimit,
    ])
    const {
      approvalTxState,
      mainTxState,
      loadingTxns,
      setMainTxState,
      setTxError,
      setGasLimit,
      close,
    } = useModalContext()
    const { refetchPoolData, refetchIncentiveData, refetchGhoData } =
      useBackgroundDataProvider()
    const { sendTx } = useWeb3Context()

    const action = async () => {
      try {
        setMainTxState({ ...mainTxState, loading: true })
        let borrowTxData = borrow({
          amount: parseUnits(amountToBorrow, poolReserve.decimals).toString(),
          reserve: poolAddress,
          interestRateMode,
          debtTokenAddress:
            interestRateMode === InterestRate.Variable
              ? poolReserve.variableDebtTokenAddress
              : poolReserve.stableDebtTokenAddress,
        })
        borrowTxData = await estimateGasLimit(borrowTxData)
        await sendTx(borrowTxData, ProtocolAction.borrow)

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

    useEffect(() => {
      const borrowGasLimit = Number(
        gasLimitRecommendations[ProtocolAction.borrow].recommended,
      )

      setGasLimit(borrowGasLimit.toString())
    }, [setGasLimit])

    return (
      <TxActionsWrapper
        blocked={blocked}
        mainTxState={mainTxState}
        approvalTxState={approvalTxState}
        requiresAmount={true}
        amount={amountToBorrow}
        isWrongNetwork={isWrongNetwork}
        handleAction={action}
        actionText={<span>Borrow {symbol}</span>}
        actionInProgressText={<span>Borrowing {symbol}</span>}
        preparingTransactions={loadingTxns}
        className={className}
      />
    )
  },
)

BorrowActions.displayName = "BorrowActions"
