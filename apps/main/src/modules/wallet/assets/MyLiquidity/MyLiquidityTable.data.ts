import Big from "big.js"
import { useMemo } from "react"

import { XykDeposit } from "@/api/account"
import { TAssetData } from "@/api/assets"
import { TShareToken, useAssets } from "@/providers/assetsProvider"
import {
  AccountOmnipoolPosition,
  useAccountOmnipoolPositionsData,
} from "@/states/account"

export type XYKPosition = XykDeposit & { price: string; meta: TShareToken }

export const isXYKPosition = (
  position: AccountOmnipoolPosition | XYKPosition,
): position is XYKPosition => "amm_pool_id" in position

export type LiquidityPositionByAsset = {
  readonly meta: TAssetData | TShareToken
  readonly currentValueHuman: string
  readonly currentHubValueHuman: string
  readonly currentTotalDisplay: string
  readonly positions: ReadonlyArray<AccountOmnipoolPosition | XYKPosition>
}

export const useMyLiquidityTableData = () => {
  const { getAssetWithFallback } = useAssets()
  const { data, isLoading } = useAccountOmnipoolPositionsData()

  const groupedData = useMemo<Array<LiquidityPositionByAsset>>(() => {
    if (isLoading) return []

    const groupedByAssetId = Object.groupBy(data?.all ?? [], (p) => p.assetId)
    return Object.entries(groupedByAssetId).map(([assetId, positionsEntry]) => {
      const positions = positionsEntry ?? []
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
  }, [data, isLoading, getAssetWithFallback])

  return { data: groupedData, isLoading }
}
