import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { MarketFormValues } from "@/modules/trade/swap/sections/Market/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { tradeUtils, papi } = useRpcProvider()

  const { slippage } = useTradeSettings()
  const { getBalance } = useAccountBalances()
  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, swap]: [
      MarketFormValues,
      Trade,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values

      if (!sellAsset || !buyAsset) {
        return
      }

      const balance = getBalance(sellAsset.id)
      const isMax = Big(swap.amountIn.toString()).gte(
        Big(balance?.free.toString() || "0").minus(5),
      )

      const tx = isMax
        ? await tradeUtils.buildSellAllTx(swap, Number(slippage))
        : await tradeUtils.buildSellTx(swap, Number(slippage))

      const { amountIn, amountOut } = swap
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
        tx: await papi.txFromCallData(tx),
        toasts: {
          submitted: t("trade:market.submit.swap.processing", params),
          success: t("trade:market.submit.swap.success", params),
          error: t("trade:market.submit.swap.error", params),
        },
      })
    },
  })
}
