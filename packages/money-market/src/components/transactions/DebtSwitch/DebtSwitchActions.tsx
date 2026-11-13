import {
  API_ETH_MOCK_ADDRESS,
  gasLimitRecommendations,
  InterestRate,
  ProtocolAction,
} from "@aave/contract-helpers"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useParaSwapTransactionHandler } from "@/helpers/useParaSwapTransactionHandler"
import { useProtocolActionToasts } from "@/hooks"
import { useAppFormatters } from "@/hooks/app-data-provider/useAppFormatters"
import { ComputedReserveData } from "@/hooks/commonTypes"
import {
  calculateSignedAmount,
  SwapTransactionParams,
} from "@/hooks/paraswap/common"
import { useRootStore } from "@/store/root"

export interface DebtSwitchActionProps {
  amountToSwap: string
  amountToReceive: string
  poolReserve: ComputedReserveData
  targetReserve: ComputedReserveData
  currentRateMode: InterestRate
  symbol: string
  blocked: boolean
  isMaxSelected: boolean
  loading?: boolean
  className?: string
  buildTxFn: () => Promise<SwapTransactionParams>
}

export const DebtSwitchActions = ({
  amountToSwap,
  amountToReceive,
  poolReserve,
  targetReserve,
  currentRateMode,
  isMaxSelected,
  loading,
  symbol,
  blocked,
  buildTxFn,
  className,
}: DebtSwitchActionProps) => {
  const { formatCurrency } = useAppFormatters()
  const paraswapRepayWithCollateral = useRootStore(
    (state) => state.paraswapRepayWithCollateral,
  )

  const protocolAction = ProtocolAction.repayCollateral
  const toasts = useProtocolActionToasts(protocolAction, {
    value: formatCurrency(amountToSwap || "0", { symbol }),
  })

  const {
    action,
    mainTxState,
    approvalTxState,
    loadingTxns,
    requiresApproval,
  } = useParaSwapTransactionHandler({
    protocolAction,
    handleGetTxns: async () => {
      const route = await buildTxFn()
      return paraswapRepayWithCollateral({
        repayAllDebt: isMaxSelected,
        repayAmount: amountToSwap,
        rateMode: currentRateMode,
        repayWithAmount: amountToReceive,
        fromAssetData: targetReserve,
        poolReserve,
        symbol,
        blocked,
        useFlashLoan: false,
        swapCallData: route.swapCallData,
        augustus: route.augustus,
        signedAmount: calculateSignedAmount(
          amountToReceive,
          targetReserve.decimals,
        ),
      })
    },
    handleGetApprovalTxns: async () => {
      return paraswapRepayWithCollateral({
        repayAllDebt: isMaxSelected,
        repayAmount: amountToSwap,
        rateMode: currentRateMode,
        repayWithAmount: amountToReceive,
        fromAssetData: targetReserve,
        poolReserve,
        symbol,
        blocked,
        useFlashLoan: false,
        swapCallData: "0x",
        augustus: API_ETH_MOCK_ADDRESS,
      })
    },
    gasLimitRecommendation:
      gasLimitRecommendations[ProtocolAction.repayCollateral].limit,
    skip: loading || !amountToSwap || parseFloat(amountToSwap) === 0,
    deps: [targetReserve.symbol, amountToSwap],
    toasts,
  })

  return (
    <TxActionsWrapper
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToSwap}
      blocked={blocked}
      requiresApproval={requiresApproval}
      actionText={<span>Swap</span>}
      actionInProgressText={<span>Swapping</span>}
      fetchingData={loading}
      className={className}
    />
  )
}
