import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import React from "react"
import { useTranslation } from "react-i18next"
import { toLowerCase } from "remeda"

import { Trade, TradeType } from "@/api/trade"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSellAllAlert } from "@/modules/trade/swap/sections/Market/MarketSellAllAlert"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async ([values, swap]: [
      MarketFormValues,
      Trade,
    ]): Promise<void> => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut, type } = swap

      if (!sellAsset) throw new Error("Invalid sell asset")
      if (!buyAsset) throw new Error("Invalid buy asset")

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buyDecimals = buyAsset.decimals
      const buySymbol = buyAsset.symbol

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

      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(address)
        .build()

      const isSellAll = tx.name === "RouterSellAll"

      await createTransaction({
        tx: tx.get(),
        alerts: isSellAll
          ? [
              {
                requiresUserConsent: false,
                variant: "warning",
                description: React.createElement(MarketSellAllAlert, {
                  asset: sellAsset,
                }),
              },
            ]
          : [],
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
