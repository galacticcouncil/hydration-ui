import Big from "big.js"
import { useMemo } from "react"

import { TAssetData, TStableswap } from "@/api/assets"
import { TShareToken, useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"

import { XYKPosition } from "./MyIsolatedPoolsLiquidity.data"
import { useMyStableswapLiquidity } from "./MyStableswapLiquidity.data"

export type StableswapPosition = {
  data: {
    currentValueHuman: string
    currentTotalDisplay: string
    currentHubValueHuman: string
    initialValue: undefined
    meta: TStableswap
  }
  assetId: string
}

export type MyLiquidityPosition =
  | AccountOmnipoolPosition
  | XYKPosition
  | StableswapPosition

export const isStableswapPosition = (
  position: MyLiquidityPosition,
): position is StableswapPosition =>
  "data" in position && !position.data.initialValue

export const isXYKPosition = (
  position: MyLiquidityPosition,
): position is XYKPosition => "amm_pool_id" in position

export type LiquidityPositionByAsset = {
  readonly meta: TAssetData | TShareToken
  readonly currentValueHuman: string
  readonly currentHubValueHuman: string
  readonly currentTotalDisplay: string
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const useMyLiquidityTableData = () => {
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading: isLoadingOmnipoolPositions } =
    useAccountOmnipoolPositionsData()
  const { data: stableswapLiquidity, isLoading: isLoadingStableswapLiquidity } =
    useMyStableswapLiquidity()

  const isLoading = isLoadingOmnipoolPositions || isLoadingStableswapLiquidity

  const groupedData = useMemo<Array<LiquidityPositionByAsset>>(() => {
    if (isLoading) return []

    const groupedByAssetId = Object.groupBy(
      [...(stableswapLiquidity ?? []), ...(data?.all ?? [])],
      (p) => p.assetId,
    )

    return Object.entries(groupedByAssetId).map(([assetId, positions = []]) => {
      const totals = positions.reduce(
        (acc, { data }) => ({
          currentValueHuman: acc.currentValueHuman.plus(data.currentValueHuman),
          currentHubValueHuman: acc.currentHubValueHuman.plus(
            data.currentHubValueHuman,
          ),
          currentTotalDisplay: acc.currentTotalDisplay.plus(
            data.currentTotalDisplay,
          ),
        }),
        {
          currentValueHuman: Big(0),
          currentHubValueHuman: Big(0),
          currentTotalDisplay: Big(0),
        },
      )

      return {
        currentValueHuman: totals.currentValueHuman.toString(),
        currentHubValueHuman: totals.currentHubValueHuman.toString(),
        currentTotalDisplay: totals.currentTotalDisplay.toString(),
        meta: getAssetWithFallback(assetId),
        positions,
      }
    })
  }, [data, isLoading, stableswapLiquidity, getAssetWithFallback])

  return { data: groupedData, isLoading }
}
