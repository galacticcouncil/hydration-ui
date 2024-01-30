import { ProtocolAction } from "@aave/contract-helpers"

import { BoxProps } from "@mui/material"
import { useRootStore } from "sections/lending/store/root"

import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export interface StakeActionProps extends BoxProps {
  amountToStake: string
  isWrongNetwork: boolean
  customGasPrice?: string
  symbol: string
  blocked: boolean
  selectedToken: string
  event: string
}

export const StakeActions = ({
  amountToStake,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  event,
  ...props
}: StakeActionProps) => {
  const { stake, stakeWithPermit } = useRootStore()

  const tryPermit = selectedToken === "aave" || selectedToken === "gho"

  const {
    action,
    approval,
    requiresApproval,
    loadingTxns,
    approvalTxState,
    mainTxState,
  } = useTransactionHandler({
    tryPermit,
    permitAction: ProtocolAction.stakeWithPermit,
    protocolAction: ProtocolAction.stake,
    handleGetTxns: async () => {
      return stake({
        token: selectedToken,
        amount: amountToStake.toString(),
      })
    },
    handleGetPermitTxns: async (signature, deadline) => {
      return stakeWithPermit({
        token: selectedToken,
        amount: amountToStake.toString(),
        signature: signature[0],
        deadline,
      })
    },
    eventTxInfo: {
      amount: amountToStake,
      assetName: selectedToken,
    },
    skip: !amountToStake || parseFloat(amountToStake) === 0 || blocked,
    deps: [amountToStake, selectedToken],
  })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      approvalTxState={approvalTxState}
      isWrongNetwork={isWrongNetwork}
      amount={amountToStake}
      handleAction={action}
      handleApproval={() =>
        approval([
          {
            amount: amountToStake,
            underlyingAsset: selectedToken,
            permitType: "STAKE",
          },
        ])
      }
      symbol={symbol}
      requiresAmount
      actionText={<span>Stake</span>}
      tryPermit={tryPermit}
      actionInProgressText={<span>Staking</span>}
      sx={sx}
      {...props}
    />
  )
}
