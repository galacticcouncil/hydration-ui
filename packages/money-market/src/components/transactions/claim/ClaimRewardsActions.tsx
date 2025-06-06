import { ProtocolAction } from "@aave/contract-helpers"

import { TxActionsWrapper } from "@/components/transactions/TxActionsWrapper"
import { Reward } from "@/helpers/types"
import { useTransactionHandler } from "@/helpers/useTransactionHandler"
import { useRootStore } from "@/store/root"

export type ClaimRewardsActionsProps = {
  isWrongNetwork?: boolean
  blocked: boolean
  selectedReward: Reward
}

export const ClaimRewardsActions = ({
  isWrongNetwork = false,
  blocked,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const claimRewards = useRootStore((state) => state.claimRewards)

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      protocolAction: ProtocolAction.claimRewards,
      eventTxInfo: {
        assetName: selectedReward.symbol,
        amount: selectedReward.balance,
      },
      tryPermit: false,
      handleGetTxns: async () => {
        return claimRewards({ isWrongNetwork, blocked, selectedReward })
      },
      skip: Object.keys(selectedReward).length === 0 || blocked,
      deps: [selectedReward],
    })

  return (
    <TxActionsWrapper
      requiresApproval={requiresApproval}
      blocked={blocked}
      preparingTransactions={loadingTxns}
      mainTxState={mainTxState}
      handleAction={action}
      actionText={
        selectedReward.symbol === "all" ? (
          <span>Claim all</span>
        ) : (
          <span>Claim {selectedReward.symbol}</span>
        )
      }
      actionInProgressText={<span>Claiming</span>}
      isWrongNetwork={isWrongNetwork}
    />
  )
}
