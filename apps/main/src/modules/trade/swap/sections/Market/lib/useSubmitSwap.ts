import { Trade } from "@galacticcouncil/sdk-next/build/types/sor"
import { useMutation } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { toLowerCase } from "remeda"

import { TradeType } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { AnyTransaction } from "@/modules/transactions/types"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, swap, tx]: [
      MarketFormValues,
      Trade,
      AnyTransaction,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut, type } = swap

      const sellDecimals = sellAsset?.decimals ?? 0
      const sellSymbol = sellAsset?.symbol ?? ""
      const buyDecimals = buyAsset?.decimals ?? 0
      const buySymbol = buyAsset?.symbol ?? ""

      const params =
        type === TradeType.Sell
          ? {
              in: t("currency", {
                value: scaleHuman(amountIn, sellDecimals),
                symbol: sellSymbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountOut, buyDecimals),
                symbol: buySymbol,
              }),
            }
          : {
              in: t("currency", {
                value: scaleHuman(amountOut, buyDecimals),
                symbol: buySymbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountIn, sellDecimals),
                symbol: sellSymbol,
              }),
            }

      await createTransaction({
        tx,
        toasts: {
          submitted: t(
            `trade:market.swap.${toLowerCase(type)}.loading`,
            params,
          ),
          success: t(`trade:market.swap.${toLowerCase(type)}.success`, params),
          error: t(`trade:market.swap.${toLowerCase(type)}.error`, params),
        },
      })
    },
  })
}
