import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useCrossChainBalanceSubscription } from "api/xcm"
import { useShallow } from "hooks/useShallow"
import { useCallback, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useEvent } from "react-use"
import { CEX_CONFIG, useDepositStore } from "sections/deposit/DepositPage.utils"
import { DepositConfig } from "sections/deposit/types"
import { useToast } from "state/toasts"
import { pick } from "utils/rx"

export type DepositSubscriptionProps = DepositConfig & {
  onDepositDetected: (deposit: DepositConfig) => void
}

const DepositSubscription: React.FC<DepositSubscriptionProps> = ({
  onDepositDetected,
  address,
  asset,
  cexId,
  balanceSnapshot,
}) => {
  const { t } = useTranslation()
  const { success } = useToast()

  const successToastRef = useRef(success)

  useEvent("beforeunload", (e: BeforeUnloadEvent) => {
    e.preventDefault()
  })

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
          successToastRef.current({
            title: (
              <Trans
                t={t}
                i18nKey="deposit.method.cex.toast.onSuccess"
                tOptions={{
                  cex: cex.title,
                }}
              >
                <span className="highlight" />
              </Trans>
            ),
          })
        }
      },
      [
        asset.data.asset.key,
        asset.depositChain,
        balanceSnapshot,
        cexId,
        onDepositDetected,
        t,
      ],
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
