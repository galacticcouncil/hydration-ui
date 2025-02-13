import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useCrossChainBalanceSubscription } from "api/xcm"
import { useShallow } from "hooks/useShallow"
import { useCallback } from "react"
import { useDepositStore } from "sections/deposit/DepositPage.utils"
import { DepositConfig } from "sections/deposit/types"
import { pick } from "utils/rx"

export type DepositSubscriptionProps = DepositConfig & {
  onDepositDetected: (deposit: DepositConfig) => void
}

const DepositSubscription: React.FC<DepositSubscriptionProps> = ({
  onDepositDetected,
  address,
  asset,
  balanceSnapshot,
}) => {
  useCrossChainBalanceSubscription(
    address,
    asset.depositChain,
    useCallback(
      (balances: AssetAmount[]) => {
        const assetKey = asset.data.asset.key
        const balance =
          balances?.find((a) => a.key === assetKey)?.amount ?? null

        if (!balanceSnapshot || !balance) return

        const amount = balance - BigInt(balanceSnapshot)

        if (amount > 0n) {
          onDepositDetected({
            ...useDepositStore.getState().currentDeposit!,
            amount: amount.toString(),
          })
        }
      },
      [asset.data.asset.key, balanceSnapshot, onDepositDetected],
    ),
  )

  return null
}

export const DepositManager = () => {
  const { currentDeposit, setCurrentDeposit, setPendingDeposit } =
    useDepositStore(
      useShallow((state) =>
        pick(state, [
          "currentDeposit",
          "setCurrentDeposit",
          "setPendingDeposit",
        ]),
      ),
    )

  if (!currentDeposit) return null
  return (
    <DepositSubscription
      {...currentDeposit}
      onDepositDetected={(deposit) => {
        setCurrentDeposit(null)
        setPendingDeposit(deposit)
      }}
    />
  )
}
