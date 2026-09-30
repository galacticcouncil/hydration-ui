import { HYDRATION_CHAIN_KEY } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import React from "react"
import { useTranslation } from "react-i18next"
import { toLowerCase } from "remeda"

import { getIntentDeadline } from "@/api/intents"
import { bestBuyQuery, bestSellQuery, TradeType } from "@/api/trade"
import { SellAllAlert } from "@/modules/trade/swap/sections/XcSwap/components/SellAllAlert"
import { getIceSwapAmounts } from "@/modules/trade/swap/sections/XcSwap/lib/iceAmounts"
import { SwapSubmitValues } from "@/modules/trade/swap/sections/XcSwap/types"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useIsIceEnabled } from "@/states/intents"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  TransactionActions,
  TransactionType,
  useTransactionsStore,
} from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

const MARKET_INTENT_DURATION_MS = minutesToMilliseconds(10)

export const useSubmitSwap = (actions?: TransactionActions) => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk } = rpc
  const isIceEnabled = useIsIceEnabled()

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()

  return useMutation({
    mutationFn: async (values: SwapSubmitValues) => {
      const { sellAsset, buyAsset } = values

      if (!sellAsset || !buyAsset) throw new Error("Invalid swap assets")
      if (!account) throw new Error("Account not connected")

      const swap = await rpc.queryClient.ensureQueryData(
        values.type === TradeType.Buy
          ? bestBuyQuery(rpc, {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountOut: values.buyAmount,
            })
          : bestSellQuery(rpc, {
              assetIn: sellAsset.id,
              assetOut: buyAsset.id,
              amountIn: values.sellAmount,
            }),
      )

      const { amountIn, amountOut, type } = swap

      const sellDecimals = sellAsset.decimals
      const sellSymbol = sellAsset.symbol
      const buyDecimals = buyAsset.decimals
      const buySymbol = buyAsset.symbol

      const params = (() => {
        switch (type) {
          case TradeType.Sell:
            return {
              in: t("currency", {
                value: scaleHuman(amountIn, sellDecimals),
                symbol: sellSymbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountOut, buyDecimals),
                symbol: buySymbol,
              }),
            }
          case TradeType.Buy:
            return {
              in: t("currency", {
                value: scaleHuman(amountOut, buyDecimals),
                symbol: buySymbol,
              }),
              out: t("currency", {
                value: scaleHuman(amountIn, sellDecimals),
                symbol: sellSymbol,
              }),
            }
        }
      })()

      if (isIceEnabled) {
        const iceAmounts = getIceSwapAmounts(swap, swapSlippage)

        // Swap intents are exact-in: amount_in is always spent, amount_out is
        // the floor. intentMarket builds every trade as a sell, so a buy would
        // only guarantee buyAmount minus slippage. Build from the amounts the
        // summary shows instead (the builder reads amountIn/amountOut/swaps).
        const tx = await sdk.tx
          .intentLimit({ ...swap, amountIn: iceAmounts.amountIn })
          .withBeneficiary(account.address)
          .withMinAmountOut(iceAmounts.amountOut)
          .withPartial(false)
          .withDeadline(await getIntentDeadline(rpc, MARKET_INTENT_DURATION_MS))
          .build()

        // Exact-in for both trade types: sell `in`, receive at least `out`
        const iceParams = {
          in: t("currency", {
            value: scaleHuman(iceAmounts.amountIn, sellDecimals),
            symbol: sellSymbol,
          }),
          out: t("currency", {
            value: scaleHuman(iceAmounts.amountOut, buyDecimals),
            symbol: buySymbol,
          }),
        }

        return createTransaction(
          {
            tx: tx.get(),
            alerts: [],
            // The toast stays `submitted` until the intent resolves;
            // useIntentToasts then fills in what was received.
            meta: {
              type: TransactionType.Onchain,
              srcChainKey: HYDRATION_CHAIN_KEY,
              intent: {
                assetIn: sellAsset.id,
                assetOut: buyAsset.id,
                amountIn: iceAmounts.amountIn.toString(),
                minAmountOut: iceAmounts.amountOut.toString(),
              },
            },
            toasts: {
              submitted: t("trade:intent.market.loading", iceParams),
              success: t("trade:intent.market.placed", iceParams),
              error: t("trade:intent.market.error", iceParams),
            },
          },
          actions,
        )
      }

      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(account.address)
        .build()

      const isSellAll = tx.name === "RouterSellAll"

      return createTransaction(
        {
          tx: tx.get(),
          activity: "swap",
          alerts: isSellAll
            ? [
                {
                  requiresUserConsent: false,
                  variant: "warning",
                  description: React.createElement(SellAllAlert, {
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
            success: t(
              `trade:market.swap.${toLowerCase(type)}.success`,
              params,
            ),
            error: t(`trade:market.swap.${toLowerCase(type)}.error`, params),
          },
        },
        actions,
      )
    },
  })
}
