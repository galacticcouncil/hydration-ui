import { TradeOrder } from "@galacticcouncil/sdk-next/build/types/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"

import { blockTimeQuery } from "@/api/chain"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitTwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const rpc = useRpcProvider()
  const { sdk } = rpc

  const { account } = useAccount()
  const address = account?.address ?? ""

  const {
    swap: {
      split: { twapMaxRetries, twapSlippage },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  const { data: blockTime } = useQuery(blockTimeQuery(rpc))

  return useMutation({
    mutationFn: async ([values, twap]: [
      MarketFormValues,
      TradeOrder,
    ]): Promise<void> => {
      const { sellAsset } = values

      if (!address) {
        return
      }

      const tx = await sdk.tx
        .order(twap)
        .withSlippage(twapSlippage)
        .withMaxRetries(twapMaxRetries)
        .withBeneficiary(address)
        .build()

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
        tx: tx.get(),
        toasts: {
          submitted: t("trade:market.twap.loading", params),
          success: t("trade:market.twap.success", params),
          error: t("trade:market.twap.error", params),
        },
      })
    },
  })
}
