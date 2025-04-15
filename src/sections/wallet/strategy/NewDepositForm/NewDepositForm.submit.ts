import { useCallback } from "react"
import { createToastMessages } from "state/toasts"
import { useStore } from "state/store"
import { useTranslation } from "react-i18next"
import { useBestTradeSell } from "api/trade"
import { useFormContext } from "react-hook-form"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useAssets } from "providers/assets"

export const useSubmitNewDepositForm = (assetId: string) => {
  const { t } = useTranslation()
  const { createTransaction } = useStore()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)

  const { watch } = useFormContext<NewDepositFormValues>()
  const [selectedAsset, amount] = watch(["asset", "amount"])

  const { minAmountOut, swapTx } = useBestTradeSell(
    selectedAsset?.id ?? "",
    assetId,
    amount,
  )

  const submit = useCallback(
    () =>
      createTransaction(
        { tx: swapTx },
        {
          toast: createToastMessages("wallet.strategy.deposit.toast", {
            t,
            tOptions: {
              strategy: asset.name,
              amount: amount,
              symbol: selectedAsset?.symbol,
            },
            components: ["span.highlight"],
          }),
        },
      ),
    [t, createTransaction, asset.name, amount, selectedAsset?.symbol, swapTx],
  )

  return { minAmountOut, submit }
}
