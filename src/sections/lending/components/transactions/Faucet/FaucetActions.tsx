
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useRootStore } from "sections/lending/store/root"

import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export type FaucetActionsProps = {
  poolReserve: ComputedReserveData
  isWrongNetwork: boolean
  blocked: boolean
}

export const FaucetActions = ({
  poolReserve,
  isWrongNetwork,
  blocked,
}: FaucetActionsProps) => {
  const mint = useRootStore((state) => state.mint)

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return mint({
          tokenSymbol: poolReserve.symbol,
          reserve: poolReserve.underlyingAsset,
        })
      },
      skip: blocked,
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<span>Faucet {poolReserve.symbol}</span>}
      actionInProgressText={<span>Pending...</span>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
    />
  )
}
