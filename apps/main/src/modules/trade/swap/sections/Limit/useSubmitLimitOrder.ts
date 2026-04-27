/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"

import { maxIntentDurationQuery } from "@/api/intents"
import { LimitFormValues } from "@/modules/trade/swap/sections/Limit/useLimitForm"
import { isErc20AToken, TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTransactionsStore } from "@/states/transactions"
import { scale } from "@/utils/formatting"

// The Intent pallet works with native asset IDs. ERC20 wrapper tokens
// (e.g. HUSDT 1111) must be mapped to their underlying asset (USDT 111).
const getIntentAssetId = (asset: TAsset): number => {
  if (isErc20AToken(asset)) {
    return Number(asset.underlyingAssetId)
  }
  return Number(asset.id)
}

// Expiry durations in milliseconds. Must stay within the runtime's
// `Intent.MaxAllowedIntentDuration` constant — going over it causes
// the extrinsic to fail with `Intent: InvalidDeadline`. The clamp
// below guarantees the deadline we submit is always strictly below
// the runtime cap, even under clock skew.
const EXPIRY_MS: Record<string, number> = {
  "15min": 15 * 60 * 1000,
  "30min": 30 * 60 * 1000,
  "1h": 60 * 60 * 1000,
  "1d": 24 * 60 * 60 * 1000,
}

/**
 * Safety margin (ms) subtracted from the runtime's max intent duration
 * before we use it to clamp `deadline - now`. Absorbs:
 *   - Clock skew between the user's machine and the chain
 *   - The time between `Date.now()` being sampled client-side and the
 *     tx actually being included in a block (usually 6–30s on Hydration)
 * Without this buffer the "1 day" option sits exactly at the runtime
 * cap and gets rejected with `Intent: InvalidDeadline`.
 */
const DEADLINE_SAFETY_MARGIN_MS = 60 * 1000

export const useSubmitLimitOrder = () => {
  const { t } = useTranslation(["common", "trade"])
  const { account } = useAccount()

  const rpc = useRpcProvider()
  const { papiClient } = rpc

  const createTransaction = useTransactionsStore((s) => s.createTransaction)
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (values: LimitFormValues) => {
      const {
        sellAsset,
        sellAmount,
        buyAsset,
        buyAmount,
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

      // Build the deadline as `now + user-chosen window`, but clamp it
      // to `(runtime max) - safety margin` so it never sits at or past
      // the runtime cap. Fetched from chain; falls back to 24h.
      const expiryMs = EXPIRY_MS[expiry]
      let deadline: bigint | undefined
      if (expiryMs !== undefined) {
        const maxDurationMs = await queryClient.ensureQueryData(
          maxIntentDurationQuery(rpc),
        )
        const maxSafeMs = Number(maxDurationMs) - DEADLINE_SAFETY_MARGIN_MS
        const effectiveMs = Math.max(1, Math.min(expiryMs, maxSafeMs))
        deadline = BigInt(Date.now() + effectiveMs)
      }

      // amount_out is exactly what the user typed in "Receive at least".
      // Limit orders are limit orders — we never silently apply user
      // slippage to lower the floor. If the user wants market-like
      // behaviour they should use the Market tab.
      const amountOutRaw = BigInt(scale(buyAmount || "0", buyAsset.decimals))

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
