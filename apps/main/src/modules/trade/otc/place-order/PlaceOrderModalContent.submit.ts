import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { PlaceOrderFormValues } from "@/modules/trade/otc/place-order/PlaceOrderModalContent.form"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

type Args = {
  readonly onSubmit: () => void
}

export const useSubmitPlaceOrder = ({ onSubmit }: Args) => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()
  const { isErc20AToken } = useAssets()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      offerAsset,
      offerAmount,
      buyAsset,
      buyAmount,
      isPartiallyFillable,
    }: PlaceOrderFormValues) => {
      if (!buyAsset || !offerAsset) {
        return
      }

      const formattedAmount = t("common:currency", {
        value: offerAmount,
        symbol: offerAsset.symbol,
      })

      const hasAToken = isErc20AToken(offerAsset) || isErc20AToken(buyAsset)

      const tx = papi.tx.OTC.place_order({
        amount_in: BigInt(scale(buyAmount, buyAsset.decimals)),
        amount_out: BigInt(scale(offerAmount, offerAsset.decimals)),
        asset_in: Number(buyAsset.id),
        asset_out: Number(offerAsset.id),
        partially_fillable: isPartiallyFillable,
      })

      onSubmit()
      await createTransaction({
        tx: hasAToken
          ? papi.tx.Dispatcher.dispatch_with_extra_gas({
              call: tx.decodedCall,
              extra_gas: AAVE_GAS_LIMIT,
            })
          : tx,
        toasts: {
          submitted: t("otc.placeOrder.loading", {
            amount: formattedAmount,
          }),
          success: t("otc.placeOrder.success", {
            amount: formattedAmount,
          }),
          error: t("otc.placeOrder.error", {
            amount: formattedAmount,
          }),
        },
      })
    },
  })
}
