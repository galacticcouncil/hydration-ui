import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useMutation } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useAccountBalances } from "@/states/account"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { papi, tradeUtils } = useRpcProvider()
  const {
    single: { swapSlippage },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()
  const { getBalance } = useAccountBalances()

  return useMutation({
    mutationFn: async ([values, swap]: [
      MarketFormValues,
      Trade,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut } = swap

      if (!sellAsset || !buyAsset) {
        return
      }

      const balance = getBalance(sellAsset.id)
      const isMax = Big(amountIn.toString()).gte(
        Big(balance?.free.toString() || "0").minus(5),
      )

      const tx = isMax
        ? await tradeUtils.buildSellAllTx(swap, Number(swapSlippage))
        : await tradeUtils.buildSellTx(swap, Number(swapSlippage))

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
