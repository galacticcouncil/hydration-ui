import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { intentsByAccountQuery } from "@/api/intents"
import {
  DcaFormValues,
  DcaOrdersMode,
} from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk, featureFlags } = rpc

  const {
    dca: { slippage, maxRetries },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([formValues, order]: [DcaFormValues, TradeDcaOrder]) => {
      const { sellAsset, buyAsset, sellAmount, orders, limitEnabled, limitPrice } =
        formValues

      if (!account) throw new Error("Account not connected")
      if (!sellAsset || !buyAsset) throw new Error("Invalid DCA assets")

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buySymbol = buyAsset.symbol
      const duration = getTimeFrameMillis(formValues.duration)
      const frequency = order.tradeCount > 0 ? duration / order.tradeCount : 0
      const isOpenBudget = orders.type === DcaOrdersMode.OpenBudget

      // Price condition ("limit TWAP"): each slice must deliver at least the
      // amount implied by the user's price. limitPrice is SELL-per-BUY, so the
      // per-slice floor = tradeAmountIn(SELL) / limitPrice, scaled to the BUY
      // asset. Exact floor, no slippage — mirrors the Limit screen.
      const minAmountOut =
        limitEnabled && limitPrice && Big(limitPrice).gt(0)
          ? BigInt(
              Big(order.tradeAmountIn.toString())
                .div(Big(10).pow(sellDecimals))
                .div(limitPrice)
                .times(Big(10).pow(buyAsset.decimals))
                .toFixed(0),
            )
          : undefined

      // The intent Dca builder emits `amount_out` from the order's `assetOutEd`
      // field. For a limit-TWAP we override it with the user's per-slice price
      // floor (a market TWAP keeps the ED). Passing it through the order works
      // with the published SDK as-is; the SDK also exposes an explicit
      // `withMinAmountOut(...)` (same effect) to switch to once released.
      const iceOrder =
        minAmountOut !== undefined
          ? { ...order, assetOutEd: minAmountOut }
          : order

      let tx
      if (featureFlags.isIceEnabled) {
        tx = await sdk.tx
          .intentOrder(iceOrder)
          .withBeneficiary(account.address)
          .withSlippage(slippage)
          .build()
      } else {
        tx = await sdk.tx
          .order(order)
          .withBeneficiary(account.address)
          .withSlippage(slippage)
          .withMaxRetries(maxRetries)
          .build()
      }

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
          submitted: t(
            `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.loading`,
            params,
          ),
          success: t(
            `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.success`,
            params,
          ),
          error: t(
            `trade:dca.${isOpenBudget ? "openBudget" : "limitedBudget"}.tx.error`,
            params,
          ),
        },
        invalidateQueries: [
          intentsByAccountQuery(rpc, account.address).queryKey,
        ],
      })
    },
  })
}
