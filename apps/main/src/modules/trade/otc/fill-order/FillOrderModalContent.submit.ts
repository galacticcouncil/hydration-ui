import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { AAVE_GAS_LIMIT } from "@/api/aave"
import { FillOrderFormValues } from "@/modules/trade/otc/fill-order/FillOrderModalContent.form"
import { OtcOfferTabular } from "@/modules/trade/otc/table/OtcTable.columns"
import { OtcOffer } from "@/modules/trade/otc/table/OtcTable.query"
import { useAssets } from "@/providers/assetsProvider"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const FULL_ORDER_PCT_LBOUND = 99

type Args = {
  readonly otcOffer: OtcOfferTabular
  readonly onSubmitted: () => void
}

export const getOtcFillOrderTx = (
  papi: Papi,
  otcOffer: OtcOffer,
  sellAmount: string,
) => {
  const filledPct = new Big(sellAmount)
    .div(otcOffer.assetAmountIn)
    .mul(100)
    .toNumber()

  return otcOffer.isPartiallyFillable && filledPct <= FULL_ORDER_PCT_LBOUND
    ? papi.tx.OTC.partial_fill_order({
        order_id: Number(otcOffer.id),
        amount_in: BigInt(scale(sellAmount, otcOffer.assetIn.decimals)),
      })
    : papi.tx.OTC.fill_order({
        order_id: Number(otcOffer.id),
      })
}

export const useSubmitFillOrder = ({ otcOffer, onSubmitted }: Args) => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()
  const { isErc20AToken } = useAssets()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async (form: FillOrderFormValues): Promise<void> => {
      const formattedAmount = t("common:currency", {
        value: form.buyAmount,
        symbol: otcOffer.assetOut.symbol,
      })

      const hasAToken =
        isErc20AToken(otcOffer.assetIn) || isErc20AToken(otcOffer.assetOut)

      const tx = getOtcFillOrderTx(papi, otcOffer, form.sellAmount)

      await createTransaction(
        {
          tx: hasAToken
            ? papi.tx.Dispatcher.dispatch_with_extra_gas({
                call: tx.decodedCall,
                extra_gas: AAVE_GAS_LIMIT,
              })
            : tx,
          toasts: {
            submitted: t("otc.fillOrder.loading", {
              amount: formattedAmount,
            }),
            success: t("otc.fillOrder.success", {
              amount: formattedAmount,
            }),
            error: t("otc.fillOrder.error", {
              amount: formattedAmount,
            }),
          },
        },
        {
          onSubmitted,
        },
      )
    },
  })
}
