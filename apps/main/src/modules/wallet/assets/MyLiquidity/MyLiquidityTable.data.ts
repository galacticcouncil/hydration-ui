import Big from "big.js"
import { useMemo } from "react"

import { TAssetData } from "@/api/assets"
import { useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"

export type LiquidityPositionByAsset = {
  readonly meta: TAssetData
  readonly currentValueHuman: string
  readonly currentHubValueHuman: string
  readonly currentTotalDisplay: string
  readonly positions: ReadonlyArray<AccountOmnipoolPosition>
}

export const useMyLiquidityTableData = () => {
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading } = useAccountOmnipoolPositionsData()

  const groupedData = useMemo<Array<LiquidityPositionByAsset>>(() => {
    if (isLoading) {
      return []
    }

    const groupedData = Map.groupBy(
      data?.all ?? [],
      (position) => position.assetId,
    )
      .entries()
      .map<LiquidityPositionByAsset>(([assetId, positions]) => {
        const totals = positions.reduce(
          (reduced, position) => {
            reduced.currentValueHuman = reduced.currentValueHuman.plus(
              position.data.currentValueHuman,
            )
            reduced.currentHubValueHuman = reduced.currentHubValueHuman.plus(
              position.data.currentHubValueHuman,
            )
            reduced.currentTotalDisplay = reduced.currentTotalDisplay.plus(
              position.data.currentTotalDisplay,
            )
            return reduced
          },
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

    return Array.from(groupedData)
  }, [data, isLoading, getAssetWithFallback])

  return { data: groupedData, isLoading }
}
