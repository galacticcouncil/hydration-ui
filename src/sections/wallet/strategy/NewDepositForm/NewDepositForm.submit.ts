import { useCallback } from "react"
import { createToastMessages } from "state/toasts"
import { useStore } from "state/store"
import { useTranslation } from "react-i18next"
import { useBestTradeSell } from "api/trade"
import { useFormContext } from "react-hook-form"
import { NewDepositFormValues } from "sections/wallet/strategy/NewDepositForm/NewDepositForm.form"
import { useAssets } from "providers/assets"
import { useBackgroundDataProvider } from "sections/lending/hooks/app-data-provider/BackgroundDataProvider"
import { useQueryClient } from "@tanstack/react-query"
import { queryKeysFactory } from "sections/lending/ui-config/queries"
import { useOnNextNetworkUpdate } from "sections/lending/hooks/app-data-provider/useOnNextNetworkUpdate"

export const useSubmitNewDepositForm = (assetId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { createTransaction } = useStore()
  const { getAssetWithFallback } = useAssets()
  const asset = getAssetWithFallback(assetId)
  const { refetchPoolData, refetchIncentiveData } = useBackgroundDataProvider()
  const onNextNetworkUpdate = useOnNextNetworkUpdate()

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
          onSuccess: () => {
            onNextNetworkUpdate(() => {
              queryClient.invalidateQueries({ queryKey: queryKeysFactory.pool })
              refetchPoolData?.()
              refetchIncentiveData?.()
            })
          },
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
    [
      amount,
      asset.name,
      createTransaction,
      onNextNetworkUpdate,
      queryClient,
      refetchIncentiveData,
      refetchPoolData,
      selectedAsset?.symbol,
      swapTx,
      t,
    ],
  )

  return { minAmountOut, submit }
}
