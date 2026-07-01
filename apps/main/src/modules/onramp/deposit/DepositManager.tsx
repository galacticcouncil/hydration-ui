import { AssetAmount } from "@galacticcouncil/xc-core"
import { differenceInMinutes } from "date-fns"
import { useCallback } from "react"
import { useInterval } from "react-use"

import { useCrossChainBalanceSubscription } from "@/api/xcm"
import { useOnrampStore } from "@/modules/onramp/store/useOnrampStore"
import { DepositConfig, OnrampScreen } from "@/modules/onramp/types"

export type DepositSubscriptionProps = DepositConfig & {
  onDepositDetected: (deposit: DepositConfig) => void
  onDepositExpired: () => void
}

const DepositSubscription: React.FC<DepositSubscriptionProps> = ({
  address,
  asset,
  createdAt,
  onDepositDetected,
  balanceSnapshot,
  onDepositExpired,
}) => {
  useInterval(() => {
    const diffMinutes = differenceInMinutes(Date.now(), createdAt)
    // if the deposit is older than 10 minutes, expire it
    if (diffMinutes >= 10) {
      onDepositExpired()
    }
  }, 1000 * 60)

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
        const isMultiStepTransfer = asset.depositChain !== "hydration"

        if (amount > 0n) {
          if (isMultiStepTransfer) {
            onDepositDetected({
              ...useOnrampStore.getState().currentDeposit!,
              amount: amount.toString(),
            })
          }
        }
      },
      [
        asset.data.asset.key,
        asset.depositChain,
        balanceSnapshot,
        onDepositDetected,
      ],
    ),
  )

  return null
}

export const DepositManager = () => {
  const { currentDeposit, setCurrentDeposit, setPendingDeposit, paginateTo } =
    useOnrampStore()

  if (!currentDeposit) return null

  return (
    <DepositSubscription
      {...currentDeposit}
      onDepositExpired={() => {
        setCurrentDeposit(null)
        paginateTo(OnrampScreen.MethodSelect)
      }}
      onDepositDetected={(deposit) => {
        setCurrentDeposit(null)
        setPendingDeposit(deposit)
      }}
    />
  )
}
