import { useAccount } from "@galacticcouncil/web3-connect"
import { CallType } from "@galacticcouncil/xc-core"
import { useMutation } from "@tanstack/react-query"
import React from "react"
import { useTranslation } from "react-i18next"
import { toLowerCase } from "remeda"

import { intentsByAccountQuery } from "@/api/intents"
import { Trade, TradeType } from "@/api/trade"
import { getIceSwapAmounts } from "@/modules/trade/swap/sections/Market/lib/iceAmounts"
import { MarketFormValues } from "@/modules/trade/swap/sections/Market/lib/useMarketForm"
import { MarketSellAllAlert } from "@/modules/trade/swap/sections/Market/MarketSellAllAlert"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useToasts } from "@/states/toasts"
import { useTradeSettings } from "@/states/tradeSettings"
import {
  isSubstrateTxResult,
  TransactionType,
  useTransactionsStore,
} from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

/** Stop watching for an intent fill after this long. */
const FILL_WATCH_TIMEOUT_MS = 3 * 60 * 1000

/** `Intent.IntentResolved` event payload (actual executed amounts). */
type IntentResolvedPayload = {
  id: bigint
  amount_in: bigint
  amount_out: bigint
}

export const useSubmitSwap = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()
  const rpc = useRpcProvider()
  const { sdk, papiClient, featureFlags } = rpc

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const { createTransaction } = useTransactionsStore()
  const { success: successToast } = useToasts()

  return useMutation({
    mutationFn: async ([values, swap]: [MarketFormValues, Trade]) => {
      const { sellAsset, buyAsset } = values
      const { amountIn, amountOut, type } = swap

      if (!sellAsset || !buyAsset) throw new Error("Invalid swap assets")
      if (!account) throw new Error("Account not connected")

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

      // Intent-based market order. There is no Buy intent on the ICE
      // pallet — the SDK builder translates a Buy trade to sell
      // semantics: amount_out floor = exact requested buy amount,
      // slippage pads amount_in instead (see IntentMarketTxBuilder).
      if (featureFlags.isIceEnabled) {
        const tx = await sdk.tx
          .intentMarket(swap)
          .withBeneficiary(account.address)
          .withSlippage(swapSlippage)
          .build()

        // The intent's on-chain bounds — same numbers the form displays
        // (exact spend / guaranteed floor). Anything the solver delivers
        // above the floor is user bonus, surfaced in the fill toast.
        const iceAmounts = getIceSwapAmounts(swap, swapSlippage)
        const guaranteedOutRaw = iceAmounts.amountOut

        // Toast copy uses the on-chain amounts too, so every number the
        // user ever sees matches the signed extrinsic.
        const iceParams =
          type === TradeType.Sell
            ? {
                in: t("currency", {
                  value: scaleHuman(iceAmounts.amountIn, sellDecimals),
                  symbol: sellSymbol,
                }),
                out: t("currency", {
                  value: scaleHuman(iceAmounts.amountOut, buyDecimals),
                  symbol: buySymbol,
                }),
              }
            : {
                in: t("currency", {
                  value: scaleHuman(iceAmounts.amountOut, buyDecimals),
                  symbol: buySymbol,
                }),
                out: t("currency", {
                  value: scaleHuman(iceAmounts.amountIn, sellDecimals),
                  symbol: sellSymbol,
                }),
              }

        // Watch for the solver resolving the intent and toast the
        // ACTUAL received amount — the tx success toast only means the
        // intent was placed, not filled.
        const watchIntentFill = (intentId: bigint, txHash: string) => {
          // The ICE descriptors don't include typed events (IEvent = {})
          // so reach through the unsafe API for the Intent pallet events.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const iceEvents = (papiClient.getUnsafeApi() as any).event
          const timer = setTimeout(
            () => subscription.unsubscribe(),
            FILL_WATCH_TIMEOUT_MS,
          )
          const subscription = iceEvents.Intent.IntentResolved.watch(
            (e: IntentResolvedPayload) => e.id === intentId,
          ).subscribe({
            next: (e: { payload: IntentResolvedPayload }) => {
              clearTimeout(timer)
              subscription.unsubscribe()
              const received = e.payload.amount_out
              const bonus = received - guaranteedOutRaw
              successToast({
                title:
                  bonus > 0n
                    ? t("trade:market.intent.filled.bonus", {
                        out: t("currency", {
                          value: scaleHuman(received, buyDecimals),
                          symbol: buySymbol,
                        }),
                        bonus: t("currency", {
                          value: scaleHuman(bonus, buyDecimals),
                          symbol: buySymbol,
                        }),
                      })
                    : t("trade:market.intent.filled", {
                        out: t("currency", {
                          value: scaleHuman(received, buyDecimals),
                          symbol: buySymbol,
                        }),
                      }),
                meta: {
                  type: TransactionType.Onchain,
                  srcChainKey: "hydration",
                  txHash,
                  ecosystem: CallType.Substrate,
                },
              })
            },
            error: () => clearTimeout(timer),
          })
        }

        return createTransaction(
          {
            tx: tx.get(),
            alerts: [],
            toasts: {
              submitted: t(
                `trade:market.swap.${toLowerCase(type)}.loading`,
                iceParams,
              ),
              success: t("trade:market.intent.placed", iceParams),
              error: t(
                `trade:market.swap.${toLowerCase(type)}.error`,
                iceParams,
              ),
            },
            invalidateQueries: [
              intentsByAccountQuery(rpc, account.address).queryKey,
            ],
          },
          {
            onSuccess: (result) => {
              if (!isSubstrateTxResult(result)) return
              const intentEvent = result.events.find(
                (e) =>
                  e.type === "Intent" && e.value.type === "IntentSubmitted",
              )
              const intentId = intentEvent?.value.value?.id
              if (typeof intentId !== "bigint") return
              watchIntentFill(intentId, result.txHash)
            },
          },
        )
      }

      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(account.address)
        .build()

      const isSellAll = tx.name === "RouterSellAll"

      return createTransaction({
        tx: tx.get(),
        activity: "swap",
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
