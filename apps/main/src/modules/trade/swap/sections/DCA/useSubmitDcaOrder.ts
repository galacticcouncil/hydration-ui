import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import { useTranslation } from "react-i18next"

import { DcaFormValues } from "@/modules/trade/swap/sections/DCA/useDcaForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { sdk } = useRpcProvider()
  const { dca } = useTradeSettings()

  const { account } = useAccount()
  const address = account?.address

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([formValues, order]: [DcaFormValues, TradeDcaOrder]) => {
      const { sellAsset, buyAsset, sellAmount } = formValues

      if (!address) {
        return
      }

      const tx = await sdk.tx
        .order(order)
        .withBeneficiary(address)
        .withSlippage(dca.slippage)
        .withMaxRetries(dca.maxRetries)
        .build()

      const sellDecimals = sellAsset?.decimals ?? 0
      const sellSymbol = sellAsset?.symbol ?? ""
      const buySymbol = buyAsset?.symbol ?? ""

      const params = {
        amountIn: t("currency", {
          value: scaleHuman(order.tradeAmountIn || "0", sellDecimals),
          symbol: sellSymbol,
        }),
        amountInBudget: t("currency", {
          value: sellAmount || "0",
          symbol: sellSymbol,
        }),
        assetOut: buySymbol,
        frequency: formatDistanceToNowStrict(Date.now() + order.frequency),
      }

      return createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: t("trade:dca.tx.loading", params),
          success: t("trade:dca.tx.success", params),
          error: t("trade:dca.tx.error", params),
        },
      })
    },
  })
}
