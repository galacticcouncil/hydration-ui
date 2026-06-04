import { TradeOrder } from "@galacticcouncil/sdk-next/sor"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"

import { blockTimeQuery } from "@/api/chain"
import { intentsByAccountQuery } from "@/api/intents"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitTwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk, featureFlags } = rpc

  const {
    swap: {
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  const { data: blockTime } = useQuery(blockTimeQuery(rpc))

  return useMutation({
    mutationFn: async ([values, twap]: [
      MarketFormValues,
      TradeOrder,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      if (!sellAsset || !buyAsset) throw new Error("Invalid twap assets")
      if (!account) throw new Error("Account not connected")

      const params = {
        noOfTrades: twap.tradeCount,
        timeframe: blockTime
          ? formatDistanceToNow(Date.now() + twap.tradeCount * blockTime, {
              includeSeconds: true,
            })
          : t("unknown"),
        in: t("currency", {
          value: scaleHuman(twap.tradeAmountIn, sellAsset.decimals),
          symbol: sellAsset.symbol,
        }),
        inTotal: t("currency", {
          value: scaleHuman(twap.amountIn, sellAsset.decimals),
          symbol: sellAsset.symbol,
        }),
      }

      const tx = featureFlags.isIceEnabled
        ? await sdk.tx
            .intentOrder(twap)
            .withBeneficiary(account.address)
            .withSlippage(twapSlippage)
            .build()
        : await sdk.tx
            .order(twap)
            .withSlippage(twapSlippage)
            .withMaxRetries(twapMaxRetries)
            .withBeneficiary(account.address)
            .build()

      await createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: t("trade:market.twap.loading", params),
          success: t("trade:market.twap.success", params),
          error: t("trade:market.twap.error", params),
        },
        invalidateQueries: [
          intentsByAccountQuery(rpc, account.address).queryKey,
        ],
      })
    },
  })
}
