import { ProtocolAction } from "@aave/contract-helpers"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useTransactionHandler } from "@/helpers/useTransactionHandler"
import { useProtocolActionToasts } from "@/hooks"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useRootStore } from "@/store/root"

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData
  usageAsCollateral: boolean
  blocked: boolean
  symbol: string
}

export const CollateralChangeActions = ({
  poolReserve,
  usageAsCollateral,
  blocked,
  symbol,
}: CollateralChangeActionsProps) => {
  const setUsageAsCollateral = useRootStore(
    (state) => state.setUsageAsCollateral,
  )

  const toasts = useProtocolActionToasts(ProtocolAction.setUsageAsCollateral, {
    value: poolReserve.symbol,
    state: usageAsCollateral ? "on" : "off",
  })

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      protocolAction: ProtocolAction.setUsageAsCollateral,
      eventTxInfo: {
        assetName: poolReserve.name,
        asset: poolReserve.underlyingAsset,
        previousState: (!usageAsCollateral).toString(),
        newState: usageAsCollateral.toString(),
      },

      handleGetTxns: async () => {
        return setUsageAsCollateral({
          reserve: poolReserve.underlyingAsset,
          usageAsCollateral,
        })
      },
      skip: blocked,
      toasts,
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      actionText={
        usageAsCollateral ? (
          <span>Enable {symbol} as collateral</span>
        ) : (
          <span>Disable {symbol} as collateral</span>
        )
      }
      actionInProgressText={<span>Pending...</span>}
      handleAction={action}
    />
  )
}
