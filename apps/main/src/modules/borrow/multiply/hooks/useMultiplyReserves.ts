import { useSupplyAssetsData } from "@galacticcouncil/money-market/hooks"
import {
  DashboardReserve,
  getReserveAddressByAssetId,
} from "@galacticcouncil/money-market/utils"
import { getAssetIdFromAddress } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { filter, pipe, sortBy } from "remeda"

import { BorrowAssetApyData } from "@/api/borrow"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import {
  MULTIPLY_ASSETS_CONFIG,
  MultiplyAssetConfig,
} from "@/modules/borrow/multiply/config"

export type MultiplyReserveRow = {
  reserve: DashboardReserve
  config: MultiplyAssetConfig
  apyData: BorrowAssetApyData | undefined
  assetId: string
}

export function useMultiplyReserves() {
  const { data, isLoading } = useSupplyAssetsData({ showAll: true })
  const { apyMap } = useApyContext()

  const rows = useMemo(() => {
    const collateralReserveIds = MULTIPLY_ASSETS_CONFIG.map((s) =>
      getReserveAddressByAssetId(s.collateralAssetId),
    )

    const reserves = pipe(
      data,
      filter((reserve) =>
        collateralReserveIds.includes(reserve.underlyingAsset),
      ),
      sortBy((reserve) =>
        collateralReserveIds.indexOf(reserve.underlyingAsset),
      ),
    )

    return reserves.map((reserve) => {
      const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
      const config = MULTIPLY_ASSETS_CONFIG.find(
        (s) => s.collateralAssetId === assetId,
      )!

      return {
        reserve,
        config,
        apyData: apyMap.get(assetId),
        assetId,
      }
    })
  }, [data, apyMap])

  return { data: rows, isLoading }
}
