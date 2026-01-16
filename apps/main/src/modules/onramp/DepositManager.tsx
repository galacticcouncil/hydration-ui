import { chainsMap } from "@galacticcouncil/xc-cfg"
import { AssetAmount } from "@galacticcouncil/xc-core"
import { differenceInMinutes } from "date-fns"
import { useCallback } from "react"
import { useTranslation } from "react-i18next"
import { useInterval } from "react-use"

import { useCrossChainBalanceSubscription } from "@/api/xcm"
import { CEX_CONFIG } from "@/modules/onramp/config/cex"
import { useDepositStore } from "@/modules/onramp/store/useDepositStore"
import { DepositConfig, OnrampScreen } from "@/modules/onramp/types"
import { useToasts } from "@/states/toasts"

export type DepositSubscriptionProps = DepositConfig & {
  onDepositDetected: (deposit: DepositConfig) => void
  onDepositExpired: () => void
}

const DepositSubscription: React.FC<DepositSubscriptionProps> = ({
  address,
  asset,
  cexId,
  createdAt,
  onDepositDetected,
  balanceSnapshot,
  onDepositExpired,
}) => {
  const { t } = useTranslation(["onramp"])
  const { success } = useToasts()

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
              ...useDepositStore.getState().currentDeposit!,
              amount: amount.toString(),
            })
          }

          const cex = CEX_CONFIG.find((c) => c.id === cexId)!
          const dstChainName = chainsMap.get(asset.depositChain)?.name ?? ""

          success({
            title: t("deposit.method.cex.toast.onSuccess", {
              cex: cex.title,
              dstChain: dstChainName,
            }),
          })
        }
      },
      [
        asset.data.asset.key,
        asset.depositChain,
        balanceSnapshot,
        cexId,
        onDepositDetected,
        success,
        t,
      ],
    ),
  )

  return null
}

export const DepositManager = () => {
  const { currentDeposit, setCurrentDeposit, setPendingDeposit, paginateTo } =
    useDepositStore()

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
