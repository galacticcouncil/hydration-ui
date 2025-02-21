import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { AssetAmount } from "@galacticcouncil/xcm-core"
import { useCrossChainBalanceSubscription } from "api/xcm"
import { differenceInMinutes } from "date-fns"
import { useShallow } from "hooks/useShallow"
import { useCallback, useRef } from "react"
import { Trans, useTranslation } from "react-i18next"
import { useEvent, useInterval } from "react-use"
import { CEX_CONFIG, useDepositStore } from "sections/deposit/DepositPage.utils"
import { DepositConfig, DepositScreen } from "sections/deposit/types"
import { useToast } from "state/toasts"
import { pick } from "utils/rx"

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
  const { t } = useTranslation()
  const { success } = useToast()

  const successToastRef = useRef(success)

  useEvent("beforeunload", (e: BeforeUnloadEvent) => {
    e.preventDefault()
  })

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
          const dstChainName = (chainsMap.get(asset.depositChain)?.name ?? "")
            .replace("(CEX)", "")
            .trim()

          successToastRef.current({
            title: (
              <Trans
                t={t}
                i18nKey="deposit.method.cex.toast.onSuccess"
                tOptions={{
                  cex: cex.title,
                  dstChain: dstChainName,
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
  const { currentDeposit, setCurrentDeposit, setPendingDeposit, paginateTo } =
    useDepositStore(
      useShallow((state) =>
        pick(state, [
          "currentDeposit",
          "setCurrentDeposit",
          "setPendingDeposit",
          "paginateTo",
        ]),
      ),
    )

  if (!currentDeposit) return null
  return (
    <DepositSubscription
      {...currentDeposit}
      onDepositExpired={() => {
        setCurrentDeposit(null)
        paginateTo(DepositScreen.Select)
      }}
      onDepositDetected={(deposit) => {
        setCurrentDeposit(null)
        setPendingDeposit(deposit)
      }}
    />
  )
}
