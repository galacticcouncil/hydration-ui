import { PoolType } from "@galacticcouncil/sdk-next/pool"
import { useQueries, useQuery } from "@tanstack/react-query"
import { formatUnits } from "viem"

import { useDebouncedValue } from "@/hooks/useDebouncedValue"
import { MULTIPLY_QUERY_KEY_PREFIX } from "@/modules/strategies/multiply/config/constants"
import { type MultiplyPair } from "@/modules/strategies/multiply/config/pairs"
import {
  FILL_MARGIN_BPS,
  type FillProbe,
  getFillsUpTo,
  getSwapLossBps,
} from "@/modules/strategies/multiply/utils/loops"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

// ponytail: the wizard only gates on the smallest unwind; add rungs back if a size hint returns
const PROBE_USD = [100]
const FILL_STALE_MS = 60_000
// the solver does not simulate these by default, so a route through them won't fill
const UNFILLABLE_POOLS: string[] = [PoolType.XYK, PoolType.LBP, PoolType.HSM]

type Leg = {
  assetIn: string
  assetOut: string
  inDecimals: number
  outDecimals: number
  inPriceUsd: number
  outPriceUsd: number
}

type FillPrices = { collateralPriceUsd: number; debtPriceUsd: number }

const useQuoteLoss = () => {
  const { sdk } = useRpcProvider()

  // Loss in bps of selling `usd` worth through the router, both sides valued
  // at the oracle prices the position is valued at.
  return async (leg: Leg, usd: number) => {
    const amountIn = (usd / leg.inPriceUsd).toFixed(leg.inDecimals)
    try {
      const trade = await sdk.api.router.getBestSell(
        Number(leg.assetIn),
        Number(leg.assetOut),
        amountIn,
      )
      if (trade.swaps.some((s) => UNFILLABLE_POOLS.includes(s.pool)))
        return Infinity
      const out = Number(formatUnits(trade.amountOut, leg.outDecimals))
      return getSwapLossBps(usd, out * leg.outPriceUsd)
    } catch {
      return Infinity
    }
  }
}

// Ramp sells debt for the collateral's aToken; unwind sells it back.
const useLegs = () => {
  const { getAssetWithFallback } = useAssets()
  return (pair: MultiplyPair, prices: FillPrices) => {
    const debt = getAssetWithFallback(pair.debtAssetId)
    const aCollateral = getAssetWithFallback(pair.aCollateralAssetId.toString())
    const debtSide = {
      id: pair.debtAssetId,
      decimals: debt.decimals,
      price: prices.debtPriceUsd,
    }
    // the aToken is 1:1 with the collateral, so it takes the collateral's price
    const aSide = {
      id: pair.aCollateralAssetId.toString(),
      decimals: aCollateral.decimals,
      price: prices.collateralPriceUsd,
    }
    const leg = (a: typeof debtSide, b: typeof debtSide): Leg => ({
      assetIn: a.id,
      assetOut: b.id,
      inDecimals: a.decimals,
      outDecimals: b.decimals,
      inPriceUsd: a.price,
      outPriceUsd: b.price,
    })
    return { ramp: leg(debtSide, aSide), unwind: leg(aSide, debtSide) }
  }
}

/** Whether each loop fills both ways at the probe sizes. */
export const useLoopFillHints = (
  loops: { pair: MultiplyPair; prices: FillPrices }[],
) => {
  const { isReady } = useRpcProvider()
  const quoteLoss = useQuoteLoss()
  const legsOf = useLegs()

  return useQueries({
    queries: loops.map(({ pair, prices }) => ({
      queryKey: [MULTIPLY_QUERY_KEY_PREFIX, "fillHint", pair.slug],
      enabled: isReady,
      staleTime: FILL_STALE_MS,
      queryFn: async () => {
        const { ramp, unwind } = legsOf(pair, prices)
        const probes: FillProbe[] = await Promise.all(
          PROBE_USD.map(async (usd) => ({
            usd,
            rampLossBps: await quoteLoss(ramp, usd),
            unwindLossBps: await quoteLoss(unwind, usd),
          })),
        )
        return getFillsUpTo(probes, pair.slippageBps - FILL_MARGIN_BPS)
      },
    })),
    combine: (results) =>
      new Map(loops.map(({ pair }, i) => [pair.slug, results[i]?.data])),
  })
}

/**
 * Whether the whole ramp volume, `(L−1)·E` worth of debt, fills both ways
 * within the margin. One quote of the whole volume bounds the first rung and
 * approximates the rungs' cumulative impact, and an oracle gap shows up as loss.
 */
export const useLoopFillCheck = (
  pair: MultiplyPair,
  volumeUsd: number,
  prices: FillPrices,
) => {
  const { isReady } = useRpcProvider()
  const quoteLoss = useQuoteLoss()
  const legsOf = useLegs()
  const [usd] = useDebouncedValue(Math.round(volumeUsd))

  return useQuery({
    queryKey: [MULTIPLY_QUERY_KEY_PREFIX, "fillCheck", pair.slug, usd],
    enabled: isReady && usd > 0,
    staleTime: FILL_STALE_MS,
    queryFn: async () => {
      const { ramp, unwind } = legsOf(pair, prices)
      const [rampLossBps, unwindLossBps] = await Promise.all([
        quoteLoss(ramp, usd),
        quoteLoss(unwind, usd),
      ])
      const margin = pair.slippageBps - FILL_MARGIN_BPS
      return {
        rampLossBps,
        unwindLossBps,
        fills: rampLossBps <= margin && unwindLossBps <= margin,
      }
    },
  })
}
