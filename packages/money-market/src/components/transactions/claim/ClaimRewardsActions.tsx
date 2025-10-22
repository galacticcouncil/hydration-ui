import { ProtocolAction } from "@aave/contract-helpers"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { Reward } from "@/helpers/types"
import { useTransactionHandler } from "@/helpers/useTransactionHandler"
import { useProtocolActionToasts } from "@/hooks"
import { useRootStore } from "@/store/root"

export type ClaimRewardsActionsProps = {
  blocked: boolean
  selectedReward: Reward
}

export const ClaimRewardsActions = ({
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const claimRewards = useRootStore((state) => state.claimRewards)

  const protocolAction = ProtocolAction.claimRewards
  const toasts = useProtocolActionToasts(protocolAction, {
    value: selectedReward.symbol,
  })

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      protocolAction,
      eventTxInfo: {
        assetName: selectedReward.symbol,
        amount: selectedReward.balance,
      },
      tryPermit: false,
      handleGetTxns: async () => {
        return claimRewards({ blocked, selectedReward })
      },
      skip: Object.keys(selectedReward).length === 0 || blocked,
      deps: [selectedReward],
      toasts,
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === "all"
          ? "Claim all"
          : `Claim ${selectedReward.symbol}`
      }
      actionInProgressText="Claiming"
    />
  )
}
