import {
  getPermitGasLimit,
  getPermitGasPrice,
  useAccount,
} from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { INTENTS_QUERY_KEY } from "@/api/intents"
import { useXcIntentsClient } from "@/api/xcIntents"
import { xcTwapOwnerOrdersQuery, xcTwapTradeQuery } from "@/api/xcIntents"
import {
  getXcTwapInfo,
  IntentDcaOrderData,
  IntentLimitOrderData,
} from "@/modules/trade/orders/lib/orderData"
import { buildXcTwapCancelTx } from "@/modules/trade/orders/lib/xcTwapCancel"
import { TRADE_ORDERS_QUERY_KEY } from "@/modules/trade/orders/TradeOrders/lib/useChainOrdersData"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"

export const useRemoveIntent = () => {
  const { t } = useTranslation("trade")
  const rpc = useRpcProvider()
  const client = useXcIntentsClient()
  const { createTransaction } = useTransactionsStore()
  const { account } = useAccount()

  const { papi } = rpc

  return useMutation({
    mutationFn: async (order: IntentLimitOrderData | IntentDcaOrderData) => {
      if (!account) throw new Error("Account not found")

      const xc = getXcTwapInfo(order)
      if (!xc) {
        return createTransaction({
          tx: papi.tx.Intent.remove_intent({ id: order.intentId }),
          toasts: {
            success: t("trade.cancelIntent.success"),
            submitted: t("trade.cancelIntent.loading"),
            error: t("trade.cancelIntent.error"),
          },
        })
      }

      const tx = await buildXcTwapCancelTx(papi, client, {
        owner: xc.terms.owner,
        terms: xc.terms,
        intentId: order.intentId,
        gas: async ({ from, to, data, value }) => {
          const [gas, gasPriceBase] = await Promise.all([
            rpc.evm.estimateGas({ account: from, to, data, value }),
            rpc.evm.getGasPrice(),
          ])
          return {
            gasLimit: getPermitGasLimit(gas, 0n),
            gasPrice: getPermitGasPrice(gasPriceBase),
          }
        },
      })

      return createTransaction({
        tx,
        toasts: {
          submitted: t("trade.orders.xc.cancel.toast.submitted"),
          success: t("trade.orders.xc.cancel.toast.success"),
          error: t("trade.orders.xc.cancel.toast.error"),
        },
        invalidateQueries: [
          INTENTS_QUERY_KEY,
          TRADE_ORDERS_QUERY_KEY,
          xcTwapOwnerOrdersQuery(xc.terms.owner).queryKey,
          xcTwapTradeQuery(client, xc.authPath).queryKey,
        ],
      })
    },
  })
}
