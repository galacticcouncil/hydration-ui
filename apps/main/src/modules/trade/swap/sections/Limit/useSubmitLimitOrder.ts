import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

// The Intent pallet works with native asset IDs. ERC20 wrapper tokens
// (e.g. HUSDT 1111) must be mapped to their underlying asset (USDT 111).
const getIntentAssetId = (asset: TAsset): number => {
  if ("underlyingAssetId" in asset && asset.underlyingAssetId) {
    return Number(
      Array.isArray(asset.underlyingAssetId)
        ? asset.id
        : asset.underlyingAssetId,
    )
  }
  return Number(asset.id)
}
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"

// Expiry durations in milliseconds (deadline field expects a ms timestamp).
const EXPIRY_MS: Record<string, number> = {
  "15m": 15 * 60 * 1000, //    900 000 ms = 15 min
  "30m": 30 * 60 * 1000, //  1 800 000 ms = 30 min
  "1h": 60 * 60 * 1000, //  3 600 000 ms =  1 hour
  "12h": 12 * 60 * 60 * 1000, // 43 200 000 ms = 12 hours
}

// When limit price is within this tolerance of the router quote rate we treat
// the order as "at market" and send minimum-received (amount - slippage) as
// amount_out instead of the raw buyAmount.
const MARKET_PRICE_TOLERANCE = 0.001 // 0.1 %

// Small buffer applied to non-market limit orders so the solver has headroom
// to fill them even with minor price movements or rounding differences.
// The user sees their exact target amount; the on-chain amount_out is reduced
// by this percentage to avoid BuyLimitNotReached rejections.
const LIMIT_ORDER_BUFFER_PCT = 0.5 // 0.5 %

export const useSubmitLimitOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()

  const rpc = useRpcProvider()
  const { papiClient } = rpc

  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()

  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: LimitFormValues) => {
      const {
        sellAsset,
        sellAmount,
        buyAsset,
        buyAmount,
        limitPrice,
        expiry,
        partiallyFillable,
      } = values

      if (!sellAsset || !buyAsset || !account) {
        return
      }

      const formattedSell = t("currency", {
        value: sellAmount,
        symbol: sellAsset.symbol,
      })
      const formattedBuy = t("currency", {
        value: buyAmount,
        symbol: buyAsset.symbol,
      })

      const expiryMs = EXPIRY_MS[expiry]
      const deadline =
        expiryMs !== undefined ? BigInt(Date.now() + expiryMs) : undefined

      // Determine amount_out for the extrinsic:
      //   - Market mode (limitPrice ≈ router quote rate): send minimum received
      //     (router amountOut - user slippage).
      //   - Non-market mode (custom price / pill): apply a small fixed buffer
      //     so the solver can fill the order despite minor price fluctuations.
      const rawBuyAmount = BigInt(scale(buyAmount || "0", buyAsset.decimals))
      // Apply small buffer: amount_out = buyAmount × (1 - buffer%)
      const bufferAmount =
        (rawBuyAmount * BigInt(Math.round(LIMIT_ORDER_BUFFER_PCT * 100))) /
        10000n
      let amountOutRaw = rawBuyAmount - bufferAmount

      try {
        const bestSell = await queryClient.fetchQuery(
          bestSellQuery(rpc, {
            assetIn: sellAsset.id,
            assetOut: buyAsset.id,
            amountIn: sellAmount || "0",
          }),
        )
        if (bestSell && sellAmount && limitPrice) {
          const marketRate = Big(
            scaleHuman(bestSell.amountOut, buyAsset.decimals) || "0",
          ).div(sellAmount)
          if (marketRate.gt(0)) {
            const drift = marketRate
              .minus(Big(limitPrice))
              .abs()
              .div(marketRate)
            if (drift.lt(MARKET_PRICE_TOLERANCE)) {
              // Market mode → apply slippage to router amountOut
              amountOutRaw =
                bestSell.amountOut -
                calculateSlippage(bestSell.amountOut, swapSlippage)
            }
          }
        }
      } catch {
        // Fall back to raw buyAmount if quote is unavailable for any reason.
      }

      // Use unsafe API to bypass descriptor checksum validation
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const unsafeApi = papiClient.getUnsafeApi() as any
      const tx = unsafeApi.tx.Intent.submit_intent({
        intent: {
          data: {
            type: "Swap",
            value: {
              asset_in: getIntentAssetId(sellAsset),
              asset_out: getIntentAssetId(buyAsset),
              amount_in: BigInt(scale(sellAmount || "0", sellAsset.decimals)),
              amount_out: amountOutRaw,
              partial: partiallyFillable,
            },
          },
          deadline,
          on_resolved: undefined,
        },
      })

      return createTransaction(
        {
          tx,
          toasts: {
            submitted: t("trade:limit.tx.submitted", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
            success: t("trade:limit.tx.success", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
            error: t("trade:limit.tx.error", {
              amountIn: formattedSell,
              amountOut: formattedBuy,
            }),
          },
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: ["intents", "byAccount", account?.address ?? ""],
            })
          },
        },
      )
    },
  })
}
