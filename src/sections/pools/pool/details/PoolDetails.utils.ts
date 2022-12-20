import { useTradeVolume } from "api/volume"
import { useMemo } from "react"
import BN from "bignumber.js"
import { BN_0, BN_10 } from "utils/constants"
import { useSpotPrices } from "api/spotPrice"
import { useAssetMetaList } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { u32 } from "@polkadot/types-codec"

export function usePoolDetailsTradeVolume(assetId: u32) {
  const volume = useTradeVolume(assetId)

  const values = useMemo(() => {
    // Assuming trade volume is the aggregate amount being
    // sent between user account and pair account
    const sums =
      volume.data?.events.reduce<Record<string, BN>>((memo, item) => {
        const assetIn = item.args.assetIn.toString()
        const assetOut = item.args.assetOut.toString()
        const amountIn = new BN(item.args.amountIn)
        const amountOut = new BN(item.args.amountIn)

        if (memo[assetIn] == null) memo[assetIn] = BN_0
        if (memo[assetOut] == null) memo[assetOut] = BN_0

        if (item.name === "Omnipool.BuyExecuted") {
          memo[assetIn] = memo[assetIn].plus(amountIn)
          memo[assetOut] = memo[assetOut].plus(amountOut)
        }

        if (item.name === "Omnipool.SellExecuted") {
          memo[assetIn] = memo[assetIn].plus(amountIn)
          memo[assetOut] = memo[assetOut].plus(amountOut)
        }

        return memo
      }, {}) ?? {}

    return { assets: Object.keys(sums), sums }
  }, [volume.data])

  const apiIds = useApiIds()
  const assets = useAssetMetaList(values.assets)
  const spotPrices = useSpotPrices(values.assets, apiIds.data?.usdId)

  const queries = [volume, apiIds, assets, ...spotPrices]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    if (volume.isLoading) return null

    const combinedAssets = spotPrices.map((spotPrice, idx) => {
      const asset = assets.data?.[idx]
      if (asset == null || spotPrice.data == null) return null
      return {
        spotPrice: spotPrice.data,
        asset: asset,
      }
    })

    let result = BN_0
    for (const item of combinedAssets) {
      if (item == null) continue

      const sum = values.sums[item.spotPrice.tokenIn]
      const sumScale = sum.dividedBy(BN_10.pow(item.asset.decimals.toNumber()))

      result = result.plus(sumScale.multipliedBy(item.spotPrice.spotPrice))
    }

    return result
  }, [volume.isLoading, assets, spotPrices, values.sums])

  return { data, isLoading }
}
