import { TradeDcaOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { formatDistanceToNowStrict } from "date-fns"
import { useTranslation } from "react-i18next"

import { DcaFormValues } from "@/modules/trade/sections/DCA/useDcaForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

// validation

export const useSubmitDcaOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { sdk, papi } = useRpcProvider()
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

      const callData = await sdk.tx
        .order(order)
        .withBeneficiary(address)
        .withSlippage(Number(dca.slippage))
        .withMaxRetries(Number(dca.maxRetries))
        .build()
        .then((tx) => tx.get().getEncodedData())

      const params = {
        amountIn: t("currency", {
          value: scaleHuman(
            order.tradeAmountIn || "0",
            sellAsset?.decimals ?? 0,
          ),
          symbol: sellAsset?.symbol ?? "",
        }),
        amountInBudget: t("currency", {
          value: sellAmount || "0",
          symbol: sellAsset?.symbol ?? "",
        }),
        assetOut: buyAsset?.symbol,
        frequency: formatDistanceToNowStrict(Date.now() + order.frequency),
      }

      return createTransaction({
        tx: await papi.txFromCallData(callData),
        toasts: {
          submitted: t("trade:dca.tx.loading", params),
          success: t("trade:dca.tx.success", params),
          error: t("trade:dca.tx.error", params),
        },
      })
    },
  })
}
