import { ProtocolAction } from "@aave/contract-helpers"
import { Trans } from "@lingui/macro"
import { BoxProps } from "@mui/material"
import { useRootStore } from "sections/lending/store/root"

import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"

export interface StakeRewardClaimRestakeActionProps extends BoxProps {
  amountToClaim: string
  isWrongNetwork: boolean
  customGasPrice?: string
  symbol: string
  blocked: boolean
  selectedToken: string
}

export const StakeRewardClaimRestakeActions = ({
  amountToClaim,
  isWrongNetwork,
  sx,
  symbol,
  blocked,
  selectedToken,
  ...props
}: StakeRewardClaimRestakeActionProps) => {
  const claimRewardsAndStake = useRootStore(
    (state) => state.claimRewardsAndStake,
  )

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      tryPermit: false,
      handleGetTxns: async () => {
        return claimRewardsAndStake({
          token: selectedToken,
          amount: amountToClaim,
        })
      },
      protocolAction: ProtocolAction.claimRewardsAndStake,
      eventTxInfo: {
        amount: amountToClaim,
        assetName: selectedToken,
      },
      skip: !amountToClaim || parseFloat(amountToClaim) === 0 || blocked,
      deps: [amountToClaim],
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      handleAction={action}
      actionText={<span>Restake {symbol}</span>}
      actionInProgressText={<span>Restaking {symbol}</span>}
      mainTxState={mainTxState}
      isWrongNetwork={isWrongNetwork}
      sx={sx}
      {...props}
    />
  )
}
