import { useTradeVolume } from "api/volume"
import { useMemo } from "react"
import BN from "bignumber.js"
import { BN_0, BN_10 } from "utils/constants"
import { useSpotPrice } from "api/spotPrice"
import { useAssetMeta } from "api/assetMeta"
import { useApiIds } from "api/consts"
import { u32 } from "@polkadot/types-codec"

export function usePoolDetailsTradeVolume(assetId: u32) {
  const volume = useTradeVolume(assetId)

  const assetTotalValue = useMemo(() => {
    // Assuming trade volume is the aggregate amount being
    // sent between user account and pair account
    const sums =
      volume.data?.events.reduce<Record<string, BN>>((memo, item) => {
        const assetIn = item.args.assetIn.toString()
        const assetOut = item.args.assetOut.toString()
        const amountIn = new BN(item.args.amountIn)
        const amountOut = new BN(item.args.amountOut)

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

    return sums[assetId.toString()]
  }, [volume.data, assetId])

  const apiIds = useApiIds()
  const assetMeta = useAssetMeta(assetId)
  const spotPrice = useSpotPrice(assetId, apiIds.data?.usdId)

  const queries = [volume, apiIds, assetMeta, spotPrice]
  const isLoading = queries.some((q) => q.isInitialLoading)

  const data = useMemo(() => {
    let result = BN_0
    if (!assetMeta.data || !spotPrice.data || !assetTotalValue) return result

    const assetScale = assetTotalValue.dividedBy(
      BN_10.pow(assetMeta.data?.decimals.toNumber()),
    )

    result = assetScale.multipliedBy(spotPrice.data.spotPrice)

    return result
  }, [assetTotalValue, spotPrice, assetMeta])

  return { data, isLoading }
}
