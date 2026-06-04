import { getTimeFrameMillis } from "@galacticcouncil/main/src/components/TimeFrame/TimeFrame.utils"
import { TradeDcaOrder } from "@galacticcouncil/sdk-next/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
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
      const { sellAsset, buyAsset, sellAmount, orders } = formValues

      if (!account) throw new Error("Account not connected")
      if (!sellAsset || !buyAsset) throw new Error("Invalid DCA assets")

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buySymbol = buyAsset.symbol
      const duration = getTimeFrameMillis(formValues.duration)
      const frequency = order.tradeCount > 0 ? duration / order.tradeCount : 0
      const isOpenBudget = orders.type === DcaOrdersMode.OpenBudget

      const tx = featureFlags.isIceEnabled
        ? await sdk.tx
            .intentOrder(order)
            .withBeneficiary(account.address)
            .withSlippage(slippage)
            .build()
        : await sdk.tx
            .order(order)
            .withBeneficiary(account.address)
            .withSlippage(slippage)
            .withMaxRetries(maxRetries)
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
