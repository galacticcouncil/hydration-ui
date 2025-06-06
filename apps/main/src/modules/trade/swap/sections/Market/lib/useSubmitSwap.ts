import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useMutation } from "@tanstack/react-query"
import { Binary } from "polkadot-api"
import { useTranslation } from "react-i18next"

import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { papi } = useRpcProvider()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, swap, swapTx]: [
      MarketFormValues,
      Trade,
      Binary,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut } = swap

      if (!sellAsset || !buyAsset) {
        return
      }

      const params = {
        in: t("currency", {
          value: scaleHuman(amountIn, sellAsset.decimals),
          symbol: sellAsset.symbol,
        }),
        out: t("currency", {
          value: scaleHuman(amountOut, buyAsset.decimals),
          symbol: buyAsset.symbol,
        }),
      }

      await createTransaction({
        tx: await papi.txFromCallData(swapTx),
        toasts: {
          submitted: t("trade:market.submit.swap.processing", params),
          success: t("trade:market.submit.swap.success", params),
          error: t("trade:market.submit.swap.error", params),
        },
      })
    },
  })
}
