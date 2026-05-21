import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import type { StableBondsFormValues } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.form"
import type { StableBondsOtcOrder } from "@/modules/strategies/stable-bonds/components/StableBondsPanel.query"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

const FULL_ORDER_PCT_LBOUND = 99

type SubmitStableBondsOrderArgs = {
  readonly values: StableBondsFormValues
  readonly order: StableBondsOtcOrder
  readonly receiveAmount: string
}

export const useSubmitStableBondsOrder = () => {
  const { t } = useTranslation(["trade", "common"])
  const { papi } = useRpcProvider()
  const { isErc20AToken } = useAssets()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)

  return useMutation({
    mutationFn: async ({
      values,
      order,
      receiveAmount,
    }: SubmitStableBondsOrderArgs): Promise<void> => {
      const formattedAmount = t("common:currency", {
        value: receiveAmount,
        symbol: order.assetOut.symbol,
      })

      const filledPct = new Big(values.depositAmount)
        .div(order.assetAmountIn)
        .mul(100)
        .toNumber()

      const tx =
        order.isPartiallyFillable && filledPct <= FULL_ORDER_PCT_LBOUND
          ? papi.tx.OTC.partial_fill_order({
              order_id: Number(order.id),
              amount_in: BigInt(
                scale(values.depositAmount, order.assetIn.decimals),
              ),
            })
          : papi.tx.OTC.fill_order({
              order_id: Number(order.id),
            })

      const hasAToken =
        isErc20AToken(order.assetIn) || isErc20AToken(order.assetOut)

      await createTransaction({
        withExtraGas: hasAToken,
        tx,
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
      })
    },
  })
}
