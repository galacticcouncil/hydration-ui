import { useQuery } from "@tanstack/react-query"
import Big from "big.js"

import { bestSellQuery } from "@/api/trade"
import { TAsset } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { scaleHuman } from "@/utils/formatting"

type Args = {
  readonly assetIn: TAsset
  readonly assetOut: TAsset
  /** Human amount of assetIn the taker pays. */
  readonly amountIn: string
  /** Human amount of assetOut received via the OTC fill, net of the OTC fee. */
  readonly otcReceive: string
  /** Gate the (potentially expensive) Omnipool quote — e.g. only on hover. */
  readonly enabled?: boolean
}

// Suppress only when there's no usable Omnipool price: no route, a zero/dust
// output, or near-total price impact (an illiquid route returns dust and the
// comparison would explode to nonsense). A real route with a large-but-valid
// difference still shows.
const NO_LIQUIDITY_IMPACT_PCT = 90

export type OtcOmnipoolComparison = {
  /** Human amount of assetOut you'd get swapping the same amountIn on Omnipool. */
  readonly omnipoolReceive: string
  /** True when the OTC fill returns at least as much as Omnipool. */
  readonly betterForTaker: boolean
  /** Positive magnitude of the advantage, in percent, in the relevant direction. */
  readonly diffPct: number
  readonly priceImpactPct: number
  readonly tradeFeePct: number
}

/**
 * Compares filling an OTC order against executing the same trade on Omnipool,
 * using a real router quote so price impact + the Omnipool swap fee are
 * included. The OTC side should already be net of the OTC fee (`otcReceive`).
 */
export const useOtcOmnipoolComparison = ({
  assetIn,
  assetOut,
  amountIn,
  otcReceive,
  enabled = true,
}: Args) => {
  const rpc = useRpcProvider()

  const query = bestSellQuery(rpc, {
    assetIn: assetIn.id,
    assetOut: assetOut.id,
    amountIn,
  })

  const {
    data: swap,
    isLoading,
    isError,
  } = useQuery({
    ...query,
    enabled:
      enabled && (query.enabled as boolean) && Big(otcReceive || "0").gt(0),
  })

  let comparison: OtcOmnipoolComparison | null = null

  if (swap) {
    const omnipoolReceive = scaleHuman(
      swap.amountOut.toString(),
      assetOut.decimals,
    )
    const otc = Big(otcReceive || "0")
    const omni = Big(omnipoolReceive)

    if (otc.gt(0) && omni.gt(0)) {
      const betterForTaker = otc.gte(omni)
      const diffPct = betterForTaker
        ? otc.div(omni).minus(1).times(100).toNumber()
        : omni.div(otc).minus(1).times(100).toNumber()

      const hasUsableQuote =
        Number.isFinite(swap.priceImpactPct) &&
        Math.abs(swap.priceImpactPct) < NO_LIQUIDITY_IMPACT_PCT

      if (hasUsableQuote) {
        comparison = {
          omnipoolReceive,
          betterForTaker,
          diffPct,
          priceImpactPct: swap.priceImpactPct,
          tradeFeePct: swap.tradeFeePct,
        }
      }
    }
  }

  return { isLoading, isError, comparison }
}
