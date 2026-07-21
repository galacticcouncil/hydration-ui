import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery } from "@tanstack/react-query"
import { useTranslation } from "react-i18next"
import { useDebounce } from "use-debounce"

import { bestSellQuery } from "@/api/trade"
import { useBilStrategy } from "@/modules/strategies/bil/BilStrategyProvider"
import type { InstantQuote } from "@/modules/strategies/bil/components/WithdrawMethodPicker"
import { BIL_QUERY_KEY_PREFIX } from "@/modules/strategies/bil/utils/queryKeys"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

/**
 * Live instant-redeem quote — swap `bilAmount` aBIL → HOLLAR via the
 * BIL/HOLLAR stableswap pool.
 *
 * Debounces the input 250ms so the SDK quote isn't re-fetched on every
 * keystroke. The `discountPct` field is computed against the queue's
 * projected payout (`queueHollarOut`) so the user sees how much value
 * they sacrifice for instant exit.
 */

export function useInstantQuote(
  bilAmount: number,
  queueHollarOut: number,
): { quote: InstantQuote | undefined; isLoading: boolean } {
  const rpc = useRpcProvider()
  const { bil, hollar } = useBilStrategy()
  const [debouncedAmount] = useDebounce(bilAmount, 250)

  // The SDK's getBestSell takes amountIn as a HUMAN-readable string (the
  // form value the user typed, e.g. "100"), NOT wei. The returned swap's
  // amountOut, however, IS in wei — so we apply scaleHuman after.
  // Mirrors apps/main/src/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount.ts.
  const { data: swap, isFetching } = useQuery(
    bestSellQuery(rpc, {
      assetIn: bil.id,
      assetOut: hollar.id,
      amountIn: debouncedAmount > 0 ? debouncedAmount.toString() : "0",
    }),
  )

  if (!swap || debouncedAmount <= 0) {
    return { quote: undefined, isLoading: isFetching }
  }

  const expectedHollarStr = scaleHuman(swap.amountOut, hollar.decimals) || "0"
  const expectedHollar = Number(expectedHollarStr)
  // discount as a signed % vs the queue path. Negative = instant gives
  // less than queue (the typical case — you pay a discount for liquidity).
  const discountPct =
    queueHollarOut > 0
      ? ((expectedHollar - queueHollarOut) / queueHollarOut) * 100
      : 0
  // SDK returns priceImpactPct as a percentage already (e.g. 0.15 = 0.15%).
  const slippagePct = Math.abs(swap.priceImpactPct ?? 0)

  return {
    quote: { expectedHollar, discountPct, slippagePct },
    isLoading: isFetching,
  }
}

/**
 * Submit the instant-redeem trade: aBIL → HOLLAR via the new stableswap
 * pool. Single substrate extrinsic (`router.sell`-equivalent built by the
 * SDK), no batching required. Slippage tolerance comes from the global
 * trade settings (same setting used by the Swap UI).
 */
export function useInstantRedeem() {
  const { t } = useTranslation(["common"])
  const { bil, hollar } = useBilStrategy()
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { createTransaction } = useTransactionsStore()
  const address = account?.address ?? ""

  return useMutation({
    mutationFn: async (bilAmount: number) => {
      // Same convention as useInstantQuote — SDK takes a human string for
      // amountIn, NOT wei.
      const swap = await sdk.api.router.getBestSell(
        Number(bil.id),
        Number(hollar.id),
        bilAmount.toString(),
      )

      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(address)
        .build()

      const fmt = t("currency", {
        value: bilAmount,
        symbol: bil.symbol,
        maximumFractionDigits: 2,
      })
      return createTransaction({
        tx: tx.get(),
        toasts: {
          submitted: `Instant-redeeming ${fmt} for HOLLAR...`,
          success: `${fmt} redeemed for HOLLAR`,
          error: `Instant redeem failed`,
        },
        invalidateQueries: [[BIL_QUERY_KEY_PREFIX]],
      })
    },
  })
}
