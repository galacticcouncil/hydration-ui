import { calculate_liquidity_out_one_asset } from "@galacticcouncil/math-stableswap"
import { useStableSDKPools } from "api/stableswap"
import { useTotalIssuances } from "api/totalIssuance"
import { useCallback } from "react"
import BN from "bignumber.js"

type Args = {
  poolId: string
  reserves: { asset_id: number; amount: string }[]
}

export const useStablepoolLiquidityOut = ({ poolId, reserves }: Args) => {
  const { data: stablePools } = useStableSDKPools()
  const stableswapSdkData = stablePools?.find((pool) => pool.id === poolId)
  const { data: issuances } = useTotalIssuances()

  const shareIssuance = issuances?.get(poolId)?.toString()

  const getAssetOutValue = useCallback(
    (assetId: number, shares: string) => {
      if (stableswapSdkData && BN(shares).gt(0)) {
        const fee = BN(stableswapSdkData.pegsFee[0])
          .div(stableswapSdkData.pegsFee[1])
          .toString()

        return calculate_liquidity_out_one_asset(
          JSON.stringify(reserves),
          shares,
          assetId,
          stableswapSdkData.amplification,
          stableswapSdkData.totalIssuance,
          fee,
          JSON.stringify(stableswapSdkData.pegs),
        )
      }

      return "0"
    },
    [reserves, stableswapSdkData],
  )

  const getAssetOutProportionally = useCallback(
    (reserveAmount: string, removeTotalShares: string) => {
      if (shareIssuance) {
        return BN(removeTotalShares)
          .div(shareIssuance)
          .times(reserveAmount)
          .toString()
      }

      return "0"
    },
    [shareIssuance],
  )

  return {
    getAssetOutValue,
    getAssetOutProportionally,
  }
}
