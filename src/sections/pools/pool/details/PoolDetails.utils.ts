import { useTradeVolume } from "api/volume"
import { useMemo } from "react"
import BN from "bignumber.js"
import { BN_0 } from "utils/constants"

export function usePoolDetailsTradeVolume(poolAddress: string) {
  const volume = useTradeVolume(poolAddress)

  return useMemo(() => {
    // Assuming trade volume is the aggregate amount being
    // sent between user account and pair account
    const sums =
      volume.data?.events.reduce<Record<number, BN>>((memo, item) => {
        if (memo[item.args.assetIn] == null) memo[item.args.assetIn] = BN_0
        if (memo[item.args.assetOut] == null) memo[item.args.assetOut] = BN_0

        if (item.name === "XYK.BuyExecuted") {
          memo[item.args.assetIn] = memo[item.args.assetIn].plus(
            item.args.amount,
          )
          memo[item.args.assetOut] = memo[item.args.assetOut].plus(
            item.args.buyPrice,
          )
        }

        if (item.name === "XYK.SellExecuted") {
          memo[item.args.assetIn] = memo[item.args.assetIn].plus(
            item.args.amount,
          )
          memo[item.args.assetOut] = memo[item.args.assetOut].plus(
            item.args.salePrice,
          )
        }

        return memo
      }, {}) ?? {}

    return Object.entries(sums).map(([assetId, sum]) => ({
      assetId: assetId.toString(),
      sum,
    }))
  }, [volume.data])
}
