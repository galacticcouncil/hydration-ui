import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { useMemo } from "react"

import { BorrowAssetApyData, useBorrowReserves } from "@/api/borrow"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import {
  FEATURED_RESERVES_COUNT,
  MULTIPLY_ASSETS_CONFIG,
  MultiplyAssetPairConfig,
} from "@/modules/borrow/multiply/config"

export type MultiplyPair = {
  id: string
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
  config: MultiplyAssetPairConfig
  apyData: BorrowAssetApyData | undefined
  collateralAssetId: string
  debtAssetId: string
}

export function useMultiplyPairs() {
  const { data, isLoading: isLoadingReserves } = useBorrowReserves()

  const { apyMap, isLoading: isLoadingApy } = useApyContext()

  const pairs = useMemo(() => {
    if (!data) return { allPairs: [], featuredParis: [] }

    const reserveByAddress = new Map(
      data.formattedReserves.map((r) => [r.underlyingAsset, r]),
    )

    const allPairs: MultiplyPair[] = []

    for (const config of MULTIPLY_ASSETS_CONFIG) {
      const collateralReserve = reserveByAddress.get(
        getReserveAddressByAssetId(config.collateralAssetId),
      )
      const debtReserve = reserveByAddress.get(
        getReserveAddressByAssetId(config.debtAssetId),
      )

      if (!collateralReserve || !debtReserve) continue

      allPairs.push({
        id: config.id,
        collateralReserve,
        debtReserve,
        config,
        apyData: apyMap.get(config.collateralAssetId),
        collateralAssetId: config.collateralAssetId,
        debtAssetId: config.debtAssetId,
      })
    }

    const featuredParis = allPairs.slice(0, FEATURED_RESERVES_COUNT)

    return {
      allPairs,
      featuredParis,
    }
  }, [data, apyMap])

  return { ...pairs, isLoading: isLoadingReserves || isLoadingApy }
}
