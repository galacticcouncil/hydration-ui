import { ProtocolAction } from "@aave/contract-helpers"
import { Trans } from "@lingui/macro"
import { BoxProps } from "@mui/material"
import { useRootStore } from "sections/lending/store/root"

import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export interface UnStakeActionProps extends BoxProps {
  amountToUnStake: string
  isWrongNetwork: boolean
  customGasPrice?: string
  symbol: string
  blocked: boolean
  selectedToken: string
}

export const UnStakeActions = ({
  amountToUnStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: UnStakeActionProps) => {
  const redeem = useRootStore((state) => state.redeem)

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return redeem(selectedToken)(amountToUnStake.toString())
      },
      skip: !amountToUnStake || parseFloat(amountToUnStake) === 0 || blocked,
      deps: [amountToUnStake],
      protocolAction: ProtocolAction.unstake,
      eventTxInfo: {
        amount: amountToUnStake,
        assetName: selectedToken,
      },
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      requiresAmount
      amount={amountToUnStake}
      actionText={<span>UNSTAKE {symbol}</span>}
      actionInProgressText={<span>Unstaking {symbol}</span>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  )
}
