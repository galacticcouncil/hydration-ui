import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { getReserveAddressByAssetId } from "@galacticcouncil/money-market/utils"
import { useMemo } from "react"

import { BorrowAssetApyData, useBorrowReserves } from "@/api/borrow"
import { useApyContext } from "@/modules/borrow/context/ApyContext"
import {
  FEATURED_MULTIPLY_HIGHLIGHTS,
  MULTIPLY_ASSETS_CONFIG,
  MULTIPLY_STRATEGIES_BY_ID,
} from "@/modules/borrow/multiply/config/pairs"
import {
  MultiplyAssetPairConfig,
  MultiplyStrategyConfig,
} from "@/modules/borrow/multiply/types"
import { getMaxReservePairLeverage } from "@/modules/borrow/multiply/utils/leverage"

export type MultiplyPair = {
  id: string
  collateralReserve: ComputedReserveData
  debtReserve: ComputedReserveData
  config: MultiplyAssetPairConfig
  apyData: BorrowAssetApyData | undefined
  collateralAssetId: string
  debtAssetId: string
}

export type FeaturedMultiplyPairItem = {
  variant: "pair"
  pair: MultiplyPair
}

export type FeaturedMultiplyStrategyItem = {
  variant: "strategy"
  strategy: MultiplyStrategyConfig
  maxApy: number
  maxLeverage: number
}

export type FeaturedMultiplyItem =
  | FeaturedMultiplyPairItem
  | FeaturedMultiplyStrategyItem

export function getPairSupplyApyPercent(pair: MultiplyPair): number {
  const baseSupplyApy = Number(pair.collateralReserve.supplyAPY) * 100
  return pair.apyData?.underlyingSupplyApy ?? baseSupplyApy
}

export function useMultiplyPairs() {
  const { data, isLoading: isLoadingReserves } = useBorrowReserves()

  const { apyMap, isLoading: isLoadingApy } = useApyContext()

  const pairs = useMemo(() => {
    if (!data)
      return { allPairs: [], featuredItems: [] as FeaturedMultiplyItem[] }

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

    const pairById = new Map(allPairs.map((p) => [p.id, p]))
    const featuredItems: FeaturedMultiplyItem[] = []

    for (const slot of FEATURED_MULTIPLY_HIGHLIGHTS) {
      if (slot.type === "pair") {
        const pair = pairById.get(slot.pairId)
        if (pair) {
          featuredItems.push({ variant: "pair", pair })
        }
      } else {
        const strategy = MULTIPLY_STRATEGIES_BY_ID[slot.strategyId]
        const constituentPairs = strategy.pairIds
          .map((id) => pairById.get(id))
          .filter((p): p is MultiplyPair => !!p)
        if (constituentPairs.length === 0) continue

        const maxApy = Math.max(
          ...constituentPairs.map(getPairSupplyApyPercent),
        )
        const maxLeverage = Math.max(
          ...constituentPairs.map((p) =>
            getMaxReservePairLeverage(p.collateralReserve, p.debtReserve),
          ),
        )
        featuredItems.push({
          variant: "strategy",
          strategy,
          maxApy,
          maxLeverage,
        })
      }
    }

    return {
      allPairs,
      featuredItems,
    }
  }, [data, apyMap])

  return { ...pairs, isLoading: isLoadingReserves || isLoadingApy }
}
