import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ReserveIncentiveResponse } from "@galacticcouncil/money-market/types"
import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
  useStableArray,
} from "@galacticcouncil/utils"
import { UseQueryResult } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"
import { zip } from "remeda"

import { useBorrowReserves } from "@/api/borrow/queries"
import { useDefillamaLatestApyQueries } from "@/api/external/defillama"
import { isStableSwap, useAssets } from "@/providers/assetsProvider"

type UnderlyingAssetApy = {
  id: string
  isStaked: boolean
  supplyApy: number
  borrowApy: number
}

export type ApyType = "supply" | "borrow"
export type BorrowAssetApyData = {
  assetId: string
  vDotApy?: number
  lpAPY?: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsApyData: UnderlyingAssetApy[]
  underlyingSupplyApy: number
  underlyingBorrowApy: number
  totalSupplyApy: number
  totalBorrowApy: number
  // farms: TFarmAprData[] | undefined @TODO farms
  // stablepoolData: TStablePoolDetails | undefined @TODO stablepoolData
}

export const useBorrowAssetsApy = (assetIds: string[]) => {
  const { getAsset, getErc20AToken } = useAssets()
  const { data: borrowReserves, isLoading } = useBorrowReserves()

  const assetIdsMemo = useStableArray(assetIds)

  const reserves = useMemo(
    () => borrowReserves?.formattedReserves ?? [],
    [borrowReserves],
  )

  const allAssetIds = useMemo(() => {
    const ids = assetIdsMemo.flatMap((assetId) => {
      const asset = getAsset(assetId)
      return asset && isStableSwap(asset) && asset.underlyingAssetId
        ? asset.underlyingAssetId
        : [assetId]
    })
    return [...new Set(ids)]
  }, [assetIdsMemo, getAsset])

  const externalApys = useDefillamaLatestApyQueries(allAssetIds)
  const externalApysMap = useMemo(() => {
    const externalApyEntries = zip(allAssetIds, externalApys)
    return new Map(externalApyEntries)
  }, [allAssetIds, externalApys])

  const data = useMemo<BorrowAssetApyData[]>(() => {
    if (isLoading) return []
    return assetIdsMemo.map((assetId) => {
      const asset = getAsset(assetId)
      const assetReserve = reserves.find(
        ({ underlyingAsset }) =>
          underlyingAsset === getAddressFromAssetId(assetId),
      )

      const incentives = (assetReserve?.aIncentivesData ?? []).filter(
        ({ incentiveAPR }) => Big(incentiveAPR).gt(0),
      )

      const stableSwapAssetIds =
        asset && isStableSwap(asset) && asset.underlyingAssetId
          ? asset.underlyingAssetId
          : [assetId]

      const underlyingAssetIds = stableSwapAssetIds.map((assetId) => {
        return getErc20AToken(assetId)?.underlyingAssetId ?? assetId
      })

      const underlyingReserves = reserves.filter((reserve) => {
        return underlyingAssetIds
          .map(getAddressFromAssetId)
          .includes(reserve.underlyingAsset)
      })

      const calculatedData = calculateAssetApyTotals(
        stableSwapAssetIds,
        underlyingReserves,
        assetReserve?.aIncentivesData ?? [],
        externalApysMap,
        // getRelatedAToken,
      )

      return {
        assetId,
        incentives,
        lpAPY: undefined, // @TODO lpAPY
        ...calculatedData,
      } satisfies BorrowAssetApyData
    })
  }, [
    assetIdsMemo,
    externalApysMap,
    getAsset,
    getErc20AToken,
    isLoading,
    reserves,
  ])

  return {
    data,
    isLoading,
  }
}

const calculateIncentivesNetAPR = (incentives: ReserveIncentiveResponse[]) => {
  const isIncentivesInfinity = incentives.some(
    (incentive) => incentive.incentiveAPR === "Infinity",
  )

  if (isIncentivesInfinity) {
    return Infinity
  }

  const total = incentives.reduce(
    (total, incentive) => total + Number(incentive.incentiveAPR),
    0,
  )

  const percent = total * 100

  return percent
}

const calculateTotalSupplyAndBorrowApy = (
  underlyingAssetsApyData: UnderlyingAssetApy[],
  incentivesNetAPR: number,
  lpAPY: number,
  farmsAPR: number,
) => {
  const underlyingSupplyApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.supplyApy,
    0,
  )

  const underlyingBorrowApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.borrowApy,
    0,
  )

  const totalSupplyApy =
    underlyingSupplyApy + incentivesNetAPR + lpAPY + farmsAPR
  const totalBorrowApy = underlyingBorrowApy + incentivesNetAPR + lpAPY

  return {
    underlyingSupplyApy,
    underlyingBorrowApy,
    totalSupplyApy,
    totalBorrowApy,
  }
}

type CalculatedAssetApyTotals = Pick<
  BorrowAssetApyData,
  | "totalSupplyApy"
  | "totalBorrowApy"
  | "underlyingBorrowApy"
  | "underlyingSupplyApy"
  | "underlyingAssetsApyData"
  | "incentivesNetAPR"
>

const calculateAssetApyTotals = (
  stableSwapAssetIds: string[],
  underlyingReserves: ComputedReserveData[],
  incentives: ReserveIncentiveResponse[],
  externalApysMap: Map<string, UseQueryResult<number>>,
  // getRelatedAToken: TAssetsContext["getRelatedAToken"],
): CalculatedAssetApyTotals => {
  const assetCount = stableSwapAssetIds.length
  const incentivesNetAPR = calculateIncentivesNetAPR(incentives)

  const underlyingAssetsApyData = underlyingReserves.map<UnderlyingAssetApy>(
    (reserve) => {
      const id = getAssetIdFromAddress(reserve.underlyingAsset)
      const supplyAPY = Big(reserve.supplyAPY)
      const borrowAPY = Big(reserve.variableBorrowAPY)
      const percentage = 100 / assetCount

      // @TODO proportion based on balance in pool
      // const balanceId = getRelatedAToken(id)?.id ?? id
      // stableSwapBalances.find((bal) => bal.id === balanceId)?.percentage ??
      // 100 / assetCount

      const proportion = percentage / 100

      return {
        id,
        isStaked: false,
        supplyApy: supplyAPY.times(100).times(proportion).toNumber(),
        borrowApy: borrowAPY.times(100).times(proportion).toNumber(),
      }
    },
  )

  for (const id of stableSwapAssetIds) {
    const externalApy = externalApysMap.get(id)

    if (externalApy?.data) {
      const percentage = 100 / assetCount

      const proportion = percentage / 100

      underlyingAssetsApyData.push({
        id,
        isStaked: true,
        supplyApy: Big(externalApy.data).times(proportion).toNumber(),
        borrowApy: Big(externalApy.data).times(proportion).toNumber(),
      })
    }
  }

  const lpAPY = 0 // @TODO lpAPY
  const farmsAPR = 0 // @TODO farmsAPR

  const apySums = calculateTotalSupplyAndBorrowApy(
    underlyingAssetsApyData,
    incentivesNetAPR,
    lpAPY,
    farmsAPR,
  )

  return {
    ...apySums,
    underlyingAssetsApyData,
    incentivesNetAPR,
  }
}
