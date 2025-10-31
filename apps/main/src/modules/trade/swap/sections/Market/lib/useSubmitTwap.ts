import { TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useMutation, useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"

import { blockTimeQuery } from "@/api/chain"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { AnyTransaction } from "@/modules/transactions/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitTwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()

  const { createTransaction } = useTransactionsStore()

  const { data: blockTime } = useQuery(blockTimeQuery(rpc))

  return useMutation({
    mutationFn: async ([values, twap, tx]: [
      MarketFormValues,
      TradeOrder,
      AnyTransaction,
    ]): Promise<void> => {
      const { sellAsset } = values
      const sellDecimals = sellAsset?.decimals ?? 0
      const sellSymbol = sellAsset?.symbol ?? ""

      const params = {
        noOfTrades: twap.tradeCount,
        timeframe: blockTime
          ? formatDistanceToNow(Date.now() + twap.tradeCount * blockTime, {
              includeSeconds: true,
            })
          : t("unknown"),
        in: t("currency", {
          value: scaleHuman(twap.tradeAmountIn, sellDecimals),
          symbol: sellSymbol,
        }),
        inTotal: t("currency", {
          value: scaleHuman(twap.amountIn, sellDecimals),
          symbol: sellSymbol,
        }),
      }

      await createTransaction({
        tx,
        toasts: {
          submitted: t("trade:market.twap.loading", params),
          success: t("trade:market.twap.success", params),
          error: t("trade:market.twap.error", params),
        },
      })
    },
  })
}
