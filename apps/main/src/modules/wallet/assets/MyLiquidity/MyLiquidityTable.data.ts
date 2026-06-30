import Big from "big.js"
import { useMemo } from "react"

import { TAssetData, TStableswap } from "@/api/assets"
import { hasVisibleDisplayValue } from "@/modules/wallet/assets/WalletAssets.utils"
import { useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"

import {
  IsolatedPoolsLiquidityByPool,
  XYKPosition,
} from "./MyIsolatedPoolsLiquidity.data"
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

export type LiquidityPositionByAsset =
  | OmnipoolLiquidityByAsset
  | IsolatedPoolsLiquidityByPool

export type OmnipoolLiquidityByAsset = {
  readonly meta: TAssetData
  readonly currentValueHuman: string
  readonly currentHubValueHuman: string
  readonly currentTotalDisplay: string
  readonly positions: ReadonlyArray<
    AccountOmnipoolPosition | StableswapPosition
  >
}

export const useMyLiquidityTableData = (showAllAssets = true) => {
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading: isLoadingOmnipoolPositions } =
    useAccountOmnipoolPositionsData()
  const { data: stableswapLiquidity, isLoading: isLoadingStableswapLiquidity } =
    useMyStableswapLiquidity()

  const isLoading = isLoadingOmnipoolPositions || isLoadingStableswapLiquidity

  const groupedData = useMemo<Array<OmnipoolLiquidityByAsset>>(() => {
    if (isLoading) return []

    const positions = [...(stableswapLiquidity ?? []), ...(data?.all ?? [])]
    const visiblePositions = showAllAssets
      ? positions
      : positions.filter((position) =>
          hasVisibleDisplayValue(position.data.currentTotalDisplay),
        )

    const groupedByAssetId = Object.groupBy(visiblePositions, (p) => p.assetId)

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
  }, [
    data,
    isLoading,
    showAllAssets,
    stableswapLiquidity,
    getAssetWithFallback,
  ])

  return { data: groupedData, isLoading }
}
