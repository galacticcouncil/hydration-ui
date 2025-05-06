import Big from "big.js"
import { useMemo } from "react"

import { TAsset, useAssets } from "@/providers/assetsProvider"
import { useAccountOmnipoolPositionsData } from "@/states/account"

export type MyLiquidityPosition = {
  readonly initialValue: string
  readonly currentValue: string
  readonly isFarm: boolean
  readonly rewards: number
}

export type LiquidityPositionByAsset = {
  readonly asset: TAsset
  readonly currentValue: string
  readonly currentValueDisplay: string
  readonly positions: ReadonlyArray<MyLiquidityPosition>
}

export const useMyLiquidityTableData = () => {
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading } = useAccountOmnipoolPositionsData()

  const groupedData = useMemo<Array<LiquidityPositionByAsset>>(() => {
    if (isLoading) {
      return []
    }

    const groupedData = Map.groupBy(
      [
        ...(data?.omnipool ?? []).map((position) => ({
          position,
          isFarm: false,
        })),
        ...(data?.omnipoolMining ?? []).map((position) => ({
          position,
          isFarm: true,
        })),
      ]
        .map(({ position, isFarm }) =>
          position.data
            ? {
                assetId: position.assetId,
                data: position.data,
                isFarm,
              }
            : null,
        )
        .filter((position) => !!position),
      (position) => position.assetId,
    )
      .entries()
      .map<LiquidityPositionByAsset>(([assetId, positions]) => {
        return {
          asset: getAssetWithFallback(assetId),
          currentValue: positions
            .reduce(
              (reduced, position) =>
                reduced.plus(position.data.currentValueHuman),
              Big(0),
            )
            .toString(),
          currentValueDisplay: positions
            .reduce(
              (reduced, position) => reduced.plus(position.data.currentDisplay),
              Big(0),
            )
            .toString(),
          positions: positions.map<MyLiquidityPosition>((position) => ({
            initialValue: position.data.initialValueHuman,
            currentValue: position.data.currentValueHuman,
            isFarm: position.isFarm,
            // TODO integrate rewards
            rewards: Math.random() * 150,
          })),
        }
      })

    return Array.from(groupedData)
  }, [data, isLoading, getAssetWithFallback])

  return { data: groupedData, isLoading }
}
