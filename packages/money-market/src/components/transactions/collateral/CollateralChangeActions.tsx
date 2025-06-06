import { ProtocolAction } from "@aave/contract-helpers"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { useTransactionHandler } from "@/helpers/useTransactionHandler"
import { ComputedReserveData } from "@/hooks/commonTypes"
import { useRootStore } from "@/store/root"

export type CollateralChangeActionsProps = {
  poolReserve: ComputedReserveData
  isWrongNetwork: boolean
  usageAsCollateral: boolean
  blocked: boolean
  symbol: string
}

export const CollateralChangeActions = ({
  poolReserve,
  isWrongNetwork,
  usageAsCollateral,
  blocked,
  symbol,
}: CollateralChangeActionsProps) => {
  const setUsageAsCollateral = useRootStore(
    (state) => state.setUsageAsCollateral,
  )

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
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
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
