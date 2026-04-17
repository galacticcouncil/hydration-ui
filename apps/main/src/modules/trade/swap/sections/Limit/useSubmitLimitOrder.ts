/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import Big from "big.js"
import { useTranslation } from "react-i18next"

import { bestSellQuery } from "@/api/trade"
import { calculateSlippage } from "@/api/utils/slippage"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { isErc20AToken, TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scale, scaleHuman } from "@/utils/formatting"

// The Intent pallet works with native asset IDs. ERC20 wrapper tokens
// (e.g. HUSDT 1111) must be mapped to their underlying asset (USDT 111).
const getIntentAssetId = (asset: TAsset): number => {
  if (isErc20AToken(asset)) {
    return Number(asset.underlyingAssetId)
  }
  return Number(asset.id)
}

// Expiry durations in milliseconds
const EXPIRY_MS: Record<string, number> = {
  "1d": 24 * 60 * 60 * 1000,
  "3d": 3 * 24 * 60 * 60 * 1000,
  "10d": 10 * 24 * 60 * 60 * 1000,
}

// When limit price is within this tolerance of the router quote rate we treat
// the order as "at market" and apply slippage buffer.
const MARKET_PRICE_TOLERANCE = 0.001

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

      // Determine amount_out:
      //   - Market mode (limitPrice ~ router quote rate): apply slippage buffer
      //   - Custom price: send exact buyAmount
      let amountOutRaw = BigInt(scale(buyAmount || "0", buyAsset.decimals))

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
              amountOutRaw =
                bestSell.amountOut -
                calculateSlippage(bestSell.amountOut, swapSlippage)
            }
          }
        }
      } catch {
        // Fall back to raw buyAmount if quote unavailable
      }

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
