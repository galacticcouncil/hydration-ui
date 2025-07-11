import { ProtocolAction } from "@aave/contract-helpers"
import { Reward } from "sections/lending/helpers/types"
import { useTransactionHandler } from "sections/lending/helpers/useTransactionHandler"
import { useRootStore } from "sections/lending/store/root"

import { TxActionsWrapper } from "sections/lending/components/transactions/TxActionsWrapper"
import { createToastMessages } from "state/toasts"
import { useTranslation } from "react-i18next"
import { ExtendedProtocolAction } from "sections/lending/ui-config/protocolAction"

export type ClaimRewardsActionsProps = {
  isWrongNetwork?: boolean
  blocked: boolean
  claimableUsd: string
  selectedReward: Reward
}

export const ClaimRewardsActions = ({
  isWrongNetwork = false,
  blocked,
  claimableUsd,
  selectedReward,
}: ClaimRewardsActionsProps) => {
  const { t } = useTranslation()
  const claimRewards = useRootStore((state) => state.claimRewards)

  const isClaimAllRewards = selectedReward?.symbol === "all"

  const { action, loadingTxns, mainTxState, requiresApproval } =
    useTransactionHandler({
      protocolAction: ProtocolAction.claimRewards,
      eventTxInfo: {
        assetName: selectedReward.symbol,
        amount: selectedReward.balance,
        action: isClaimAllRewards
          ? ExtendedProtocolAction.claimAllRewards
          : ProtocolAction.claimRewards,
      },
      tryPermit: false,
      handleGetTxns: async () => {
        return claimRewards({
          isWrongNetwork,
          blocked,
          selectedReward,
          claimableUsd,
        })
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
      handleAction={() => {
        const toasts = isClaimAllRewards
          ? createToastMessages("lending.claimAllRewards.toast", {
              t,
              tOptions: {
                value: claimableUsd,
              },
              components: ["span.highlight"],
            })
          : createToastMessages("lending.claimRewards.toast", {
              t,
              tOptions: {
                symbol: selectedReward.symbol,
                value: selectedReward.balance,
              },
              components: ["span.highlight"],
            })
        return action(toasts)
      }}
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
