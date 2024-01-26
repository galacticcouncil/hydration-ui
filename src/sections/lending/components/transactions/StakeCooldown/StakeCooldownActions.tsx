import { ProtocolAction } from "@aave/contract-helpers"

import { BoxProps } from "@mui/material"
import { useRootStore } from "sections/lending/store/root"

import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export interface StakeCooldownActionsProps extends BoxProps {
  isWrongNetwork: boolean
  customGasPrice?: string
  blocked: boolean
  selectedToken: string
  amountToCooldown: string
}

export const StakeCooldownActions = ({
  isWrongNetwork,
  sx,
  blocked,
  selectedToken,
  amountToCooldown,
  ...props
}: StakeCooldownActionsProps) => {
  const cooldown = useRootStore((state) => state.cooldown)

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return cooldown(selectedToken)
      },
      skip: blocked,
      deps: [],
      protocolAction: ProtocolAction.stakeCooldown,
      eventTxInfo: {
        amount: amountToCooldown,
        assetName: selectedToken,
      },
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<span>Activate Cooldown</span>}
      actionInProgressText={<span>Activate Cooldown</span>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  )
}
