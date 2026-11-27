import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { dcaOrderQuery } from "@/api/trade"
import { getTimeFrameMillis } from "@/components/TimeFrame/TimeFrame.utils"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { validateDcaOrder } from "@/modules/trade/swap/sections/DCA/useDcaValidation"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])

  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk } = rpc

  const {
    dca: { slippage: twapSlippage },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async (values: DcaFormValues) => {
      const {
        sellAsset,
        buyAsset,
        sellAmount,
        orders,
        limitEnabled,
        limitPrice,
      } = values

      if (!account) throw new Error("Account not connected")
      if (!sellAsset) throw new Error("Invalid sell asset")
      if (!buyAsset) throw new Error("Invalid buy asset")

      const order = await rpc.queryClient.ensureQueryData(
        dcaOrderQuery(rpc, values),
      )

      if (!order) throw new Error("Failed to build DCA order")
      if (
        validateDcaOrder(order, values.duration, twapSlippage).errors.length
      ) {
        throw new Error("DCA order failed validation")
      }

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buySymbol = buyAsset.symbol
      const duration = getTimeFrameMillis(values.duration)
      const frequency = order.tradeCount > 0 ? duration / order.tradeCount : 0
      const isOpenBudget = orders.type === DcaOrdersMode.OpenBudget
      const budget = isOpenBudget ? "openBudget" : "limitedBudget"

      const minAmountOut =
        limitEnabled && limitPrice && Big(limitPrice).gt(0)
          ? BigInt(
              Big(order.tradeAmountIn.toString())
                .div(Big(10).pow(sellDecimals))
                .times(limitPrice)
                .times(Big(10).pow(buyAsset.decimals))
                .toFixed(0),
            )
          : undefined

      const iceOrder =
        minAmountOut !== undefined
          ? {
              ...order,
              assetOutEd:
                minAmountOut > order.assetOutEd
                  ? minAmountOut
                  : order.assetOutEd,
            }
          : order

      const tx = await sdk.tx
        .intentOrder(iceOrder)
        .withBeneficiary(account.address)
        .withSlippage(twapSlippage)
        .build()

      const params = {
        amountIn: t("currency", {
          value: scaleHuman(order.tradeAmountIn, sellDecimals),
          symbol: sellSymbol,
        }),
        amountInBudget: t("currency", {
          value: sellAmount,
          symbol: sellSymbol,
        }),
        assetOut: buySymbol,
        frequency: isOpenBudget ? duration : frequency,
      }

      return createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: t(`trade:intent.dca.${budget}.loading`, params),
          success: t(`trade:intent.dca.${budget}.placed`, params),
          error: t(`trade:intent.dca.${budget}.error`, params),
        },
      })
    },
  })
}
