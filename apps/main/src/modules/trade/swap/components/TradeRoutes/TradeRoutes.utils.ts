import {
  BuySwap,
  SellSwap,
  Swap,
} from "@galacticcouncil/sdk-next/build/types/sor"
import {
  GDOT_ASSET_ID,
  GETH_ASSET_ID,
  GSOL_ASSET_ID,
  HOLLAR_ASSETS,
} from "@galacticcouncil/utils"
import Big from "big.js"

import { TradeType } from "@/api/trade"
import { TAsset } from "@/providers/assetsProvider"
import { scaleHuman } from "@/utils/formatting"

export const mapRoutes = (
  swapType: TradeType,
  routes: ReadonlyArray<Swap>,
  getAssetWithFallback: (id: number) => TAsset,
) => {
  const isSellSwap = swapType === TradeType.Sell

  const routesWithData = routes.map((route) => {
    const assetIn = getAssetWithFallback(route.assetIn)
    const assetOut = getAssetWithFallback(route.assetOut)
    const amountIn = scaleHuman(route.amountIn, assetIn.decimals)
    const amountOut = scaleHuman(route.amountOut, assetOut.decimals)

    const tradeFeeAsset = isSellSwap ? assetOut : assetIn
    const [calculatedAmount, amount] = isSellSwap
      ? [
          scaleHuman((route as SellSwap).calculatedOut, assetOut.decimals),
          amountOut,
        ]
      : [
          scaleHuman((route as BuySwap).calculatedIn, assetIn.decimals),
          amountIn,
        ]

    const tradeFee = Big(calculatedAmount).minus(amount)

    // Cant reuse the one from SDK as it as a number with precision loss and accumulating it later would not add to the same total
    const tradeFeePct = Big(calculatedAmount).gt(0)
      ? tradeFee.div(calculatedAmount).times(100).toString()
      : "0"

    return {
      assetIn,
      assetOut,
      amountIn,
      amountOut,
      tradeFeePct,
      tradeFees: [
        {
          value: tradeFee.toString(),
          asset: tradeFeeAsset,
        },
      ],
    }
  })

  return routesWithData.reduce<typeof routesWithData>((routes, route, i) => {
    const shouldSkip = HIDDEN_HOP_ASSET_IDS.includes(route.assetIn.id)
    const previousRoute = routes[i - 1]

    if (!shouldSkip || !previousRoute) {
      return [...routes, route]
    }

    previousRoute.assetOut = route.assetOut
    previousRoute.amountOut = route.amountOut
    previousRoute.tradeFees.push(...route.tradeFees)

    // accumulates percentage fee loss
    previousRoute.tradeFeePct = Big(1)
      .minus(
        Big(1)
          .minus(Big(previousRoute.tradeFeePct).div(100))
          .times(Big(1).minus(Big(route.tradeFeePct).div(100))),
      )
      .times(100)
      .toString()

    return routes
  }, [])
}

const HIDDEN_HOP_ASSET_IDS = [
  GDOT_ASSET_ID,
  GETH_ASSET_ID,
  GSOL_ASSET_ID,
  ...HOLLAR_ASSETS,
]

export type TradeRoute = ReturnType<typeof mapRoutes>[number]
export type TradeRouteFee = TradeRoute["tradeFees"][number]
