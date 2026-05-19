import { useAccount } from "@galacticcouncil/web3-connect"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useDebounce } from "use-debounce"

import { bestSellQuery } from "@/api/trade"
import type { InstantQuote } from "@/modules/hdcl-vault/components/WithdrawMethodPicker"
import {
  HOLLAR_ASSET_ID,
  STABLESWAP_HDCL_ASSET_ID,
} from "@/modules/hdcl-vault/constants"
import { formatNumber } from "@/modules/hdcl-vault/utils/format"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useTradeSettings } from "@/states/tradeSettings"
import { useTransactionsStore } from "@/states/transactions"
import { scaleHuman } from "@/utils/formatting"

/**
 * Live instant-redeem quote — swap `hdclAmount` aHDCL → HOLLAR via the
 * HDCL/HOLLAR stableswap pool.
 *
 * Debounces the input 250ms so the SDK quote isn't re-fetched on every
 * keystroke. The `discountPct` field is computed against the queue's
 * projected payout (`queueHollarOut`) so the user sees how much value
 * they sacrifice for instant exit.
 */
// HOLLAR decimals — used to scale the wei amountOut returned by the SDK
// back to a human number for display.
const HOLLAR_DECIMALS = 18

export function useInstantQuote(
  hdclAmount: number,
  queueHollarOut: number,
): { quote: InstantQuote | undefined; isLoading: boolean } {
  const rpc = useRpcProvider()
  const [debouncedAmount] = useDebounce(hdclAmount, 250)

  // The SDK's getBestSell takes amountIn as a HUMAN-readable string (the
  // form value the user typed, e.g. "100"), NOT wei. The returned swap's
  // amountOut, however, IS in wei — so we apply scaleHuman after.
  // Mirrors apps/main/src/modules/trade/swap/sections/Market/lib/useCalculateBuyAmount.ts.
  const { data: swap, isFetching } = useQuery(
    bestSellQuery(rpc, {
      assetIn: STABLESWAP_HDCL_ASSET_ID.toString(),
      assetOut: HOLLAR_ASSET_ID.toString(),
      amountIn: debouncedAmount > 0 ? debouncedAmount.toString() : "0",
    }),
  )

  if (!swap || debouncedAmount <= 0) {
    return { quote: undefined, isLoading: isFetching }
  }

  const expectedHollarStr = scaleHuman(swap.amountOut, HOLLAR_DECIMALS) || "0"
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
 * Submit the instant-redeem trade: aHDCL → HOLLAR via the new stableswap
 * pool. Single substrate extrinsic (`router.sell`-equivalent built by the
 * SDK), no batching required. Slippage tolerance comes from the global
 * trade settings (same setting used by the Swap UI).
 */
export function useInstantRedeem() {
  const { sdk } = useRpcProvider()
  const { account } = useAccount()
  const {
    swap: {
      single: { swapSlippage },
    },
  } = useTradeSettings()
  const { createTransaction } = useTransactionsStore()
  const queryClient = useQueryClient()
  const address = account?.address ?? ""

  return useMutation({
    mutationFn: async (hdclAmount: number) => {
      // Same convention as useInstantQuote — SDK takes a human string for
      // amountIn, NOT wei.
      const swap = await sdk.api.router.getBestSell(
        Number(STABLESWAP_HDCL_ASSET_ID),
        Number(HOLLAR_ASSET_ID),
        hdclAmount.toString(),
      )
      const tx = await sdk.tx
        .trade(swap)
        .withSlippage(swapSlippage)
        .withBeneficiary(address)
        .build()

      const fmt = formatNumber(hdclAmount, 2)
      return createTransaction(
        {
          tx: tx.get(),
          toasts: {
            submitted: `Instant-redeeming ${fmt} HDCL for HOLLAR...`,
            success: `${fmt} HDCL redeemed for HOLLAR`,
            error: `Instant redeem failed`,
          },
        },
        {
          onSuccess: () => {
            // Refresh the user's balances + the vault/pool views.
            queryClient.invalidateQueries({ queryKey: ["hdcl-vault-balances"] })
            queryClient.invalidateQueries({ queryKey: ["hdcl-vault-stats"] })
            queryClient.invalidateQueries({ queryKey: ["hdcl-pool-position"] })
          },
        },
      )
    },
  })
}

// NOTE: there is intentionally NO `useInstantRedeemFromQueue` hook.
//
// We tried building one (cancelRedeem on EVM + substrate router-trade of
// raw HDCL → HOLLAR, batched). The cancel side worked, but the SDK's
// router rejects asset 55 (raw HDCL) with "55 is not supported asset"
// because the HDCL Aave instance is a SECOND, separate Aave deployment
// from the main money-market — and the SDK discovers Aave reserves via
// the runtime's `AaveTradeExecutor.pools()` API, which on Hydration is
// backed by a single-pool storage value (`pallet_liquidation::Borrowing-
// Contract`) and only ever returns reserves for the main MM pool.
//
// Making the SDK aware of the second instance requires upgrading that
// chain-side storage to a map and looping the runtime API over all
// registered pools. That's a `hydration-node` runtime upgrade + governance
// flow, deferred (see HDCL-UI-HANDOVER.md "SDK doesn't know about the
// second Aave instance").
//
// Until that lands, users wanting an instant exit on a queued request
// click Cancel (which auto-resupplies the freed HDCL as aHDCL) and then
// use the WithdrawModal's instant path on the liquid aHDCL balance. Two
// signatures, but no atomicity hole and no surprises.
