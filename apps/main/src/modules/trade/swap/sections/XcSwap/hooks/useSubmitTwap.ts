import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { formatDistanceToNow } from "date-fns"
import { useTranslation } from "react-i18next"

import {
  bestBuyQuery,
  bestSellTwapQuery,
  tradeOrderDurationQuery,
  TradeType,
} from "@/api/trade"
import { SwapSubmitValues } from "@/modules/trade/swap/sections/XcSwap/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useIsIceEnabled } from "@/states/intents"
import { useTradeSettings } from "@/states/tradeSettings"
import { TransactionActions, useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitTwap = (actions?: TransactionActions) => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk } = rpc
  const isIceEnabled = useIsIceEnabled()

  const {
    swap: {
      split: { twapSlippage, twapMaxRetries },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async (values: SwapSubmitValues) => {
      const { sellAsset, buyAsset } = values

      if (!sellAsset) throw new Error("Invalid sell asset")
      if (!buyAsset) throw new Error("Invalid buy asset")
      if (!account) throw new Error("Account not connected")

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol

      const budget = await (async () => {
        if (values.type !== TradeType.Buy) return values.sellAmount

        const quote = await rpc.queryClient.ensureQueryData(
          bestBuyQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountOut: values.buyAmount,
          }),
        )

        return scaleHuman(quote.amountIn, sellDecimals)
      })()

      const twap = await rpc.queryClient.ensureQueryData(
        bestSellTwapQuery(rpc, {
          assetIn: sellAsset.id,
          assetOut: buyAsset.id,
          amountIn: budget,
        }),
      )

      const duration = await rpc.queryClient
        .ensureQueryData(
          tradeOrderDurationQuery(
            rpc,
            isIceEnabled,
            twap.tradeCount,
            twap.tradePeriod,
          ),
        )
        .catch(() => 0)

      const params = {
        noOfTrades: twap.tradeCount,
        timeframe: duration
          ? formatDistanceToNow(Date.now() + duration, {
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

      const tx = isIceEnabled
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

      return createTransaction(
        {
          tx: tx.get(),
          toasts: {
            submitted: t("trade:market.twap.loading", params),
            success: t("trade:market.twap.success", params),
            error: t("trade:market.twap.error", params),
          },
        },
        actions,
      )
    },
  })
}
