import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { bestSellQuery } from "@/api/trade"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export type LimitFillStatus = {
  // Price the order asks for, expressed as "receive per sell" (to per from) —
  // e.g. HDX per PRIME. Matches how the row/detail render the limit price.
  readonly orderRate: string | null
  // Current market rate to DISPLAY, in the same denomination (to per from).
  // Quoted at 1 unit so it's size-independent and reads the same as the
  // compose screen — it doesn't drift with the order/slice size.
  readonly marketRate: string | null
  // How far the market is from triggering, in %, computed from the true
  // per-execution rate (below). Positive => not there yet; <= 0 => fillable.
  readonly distancePct: number | null
  readonly fillable: boolean
  readonly isLoading: boolean
}

type Args = {
  readonly from: TAsset
  readonly to: TAsset
  // Human amounts for a single execution: what's sold and the min received
  // (the price floor). For a plain limit order this is the whole order; for a
  // limit TWAP it's one slice. Pass null to disable (e.g. a market TWAP).
  readonly sellAmount: string | null
  readonly receiveAmount: string | null
}

/**
 * Fill status for a price-conditioned order, in a single sell-relative
 * denomination.
 *
 * The order sells `from` for at least `to`, so it becomes fillable when the
 * market pays at least the asked rate (to per from). Everything is expressed
 * as "receive per sell" so the order price and the market price compare
 * directly, with no denomination flip.
 */
export const useLimitFillStatus = ({
  from,
  to,
  sellAmount,
  receiveAmount,
}: Args): LimitFillStatus => {
  const rpc = useRpcProvider()

  const orderRate =
    sellAmount && receiveAmount && Big(sellAmount).gt(0)
      ? Big(receiveAmount).div(sellAmount)
      : null

  // Displayed market price — quoted at 1 unit so it's size-independent and
  // matches the compose screen.
  const { data: spotSwap, isLoading: spotLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: from.id,
      assetOut: to.id,
      amountIn: sellAmount ? "1" : "0",
    }),
  )

  // Fill check — quoted at the real per-execution size so the trigger reflects
  // the actual execution rate (incl. this trade's own price impact).
  const { data: fillSwap, isLoading: fillLoading } = useQuery(
    bestSellQuery(rpc, {
      assetIn: from.id,
      assetOut: to.id,
      amountIn: sellAmount ?? "0",
    }),
  )

  // out/in in the "receive per sell" denomination (to per from).
  const rateOf = (swap: typeof spotSwap) => {
    if (!swap) return null
    try {
      const inHuman = Big(swap.amountIn.toString()).div(
        Big(10).pow(from.decimals),
      )
      const outHuman = Big(swap.amountOut.toString()).div(
        Big(10).pow(to.decimals),
      )
      return inHuman.gt(0) ? outHuman.div(inHuman) : null
    } catch {
      return null
    }
  }

  const marketRate = rateOf(spotSwap)
  const fillRate = rateOf(fillSwap)

  const fillable = !!orderRate && !!fillRate && fillRate.gte(orderRate)

  const distancePct =
    orderRate && fillRate && fillRate.gt(0)
      ? orderRate.div(fillRate).minus(1).times(100).toNumber()
      : null

  return {
    orderRate: orderRate?.toString() ?? null,
    marketRate: marketRate?.toString() ?? null,
    distancePct,
    fillable,
    isLoading: spotLoading || fillLoading,
  }
}
