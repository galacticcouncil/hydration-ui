import { stablepoolYieldMetricsQuery } from "@galacticcouncil/indexer/squid"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ReserveIncentiveResponse } from "@galacticcouncil/money-market/types"
import { getUserClaimableRewards } from "@galacticcouncil/money-market/utils"
import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
  useStableArray,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { useMemo } from "react"

import {
  ExternalApyType,
  useBorrowReserves,
  useExternalApys,
  useUserBorrowSummary,
} from "@/api/borrow/queries"
import { useSquidClient } from "@/api/provider"
import { useStablepoolsReserves } from "@/modules/liquidity/Liquidity.utils"
import { TStablepoolDetails } from "@/modules/liquidity/Liquidity.utils"
import {
  isStableSwap,
  TAssetsContext,
  useAssets,
} from "@/providers/assetsProvider"

type UnderlyingAssetApy = {
  id: string
  apyType?: ExternalApyType
  supplyApy: number | null
  borrowApy: number | null
}

export type ApyType = "supply" | "borrow"
export type BorrowAssetApyData = {
  assetId: string
  vDotApy?: number
  lpAPY?: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsApyData: UnderlyingAssetApy[]
  underlyingSupplyApy: number | null
  underlyingBorrowApy: number | null
  totalSupplyApy: number | null
  totalBorrowApy: number | null
  supplyMMApy: number | null
  borrowMMApy: number | null
  stablepoolData: TStablepoolDetails | undefined
}

export const useBorrowAssetsApy = (assetIds: string[]) => {
  const squidClient = useSquidClient()
  const { getAsset, getErc20AToken, getRelatedAToken } = useAssets()
  const { data: borrowReserves, isLoading: isLoadingBorrowReserves } =
    useBorrowReserves()

  const { data: stablepoolsReserves, isLoading: isLoadingStablepoolsReserves } =
    useStablepoolsReserves(assetIds)

  const stablepoolsMap = useMemo<Map<string, TStablepoolDetails>>(() => {
    return new Map(
      stablepoolsReserves.map((item) => [item.pool.id.toString(), item]),
    )
  }, [stablepoolsReserves])

  const assetIdsMemo = useStableArray(assetIds)

  const { data: yieldMetrics, isLoading: isYieldMetricsLoading } = useQuery(
    stablepoolYieldMetricsQuery(squidClient),
  )

  const yieldsMap = useMemo<Map<string, number>>(() => {
    return new Map(
      yieldMetrics?.map((item) => [
        item.poolId,
        Number(item.projectedApyPerc),
      ]) ?? [],
    )
  }, [yieldMetrics])

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

  const { data: externalApys, isLoading: isLoadingExternalApys } =
    useExternalApys(allAssetIds)

  const isLoading =
    isLoadingBorrowReserves ||
    isLoadingStablepoolsReserves ||
    isYieldMetricsLoading ||
    isLoadingExternalApys

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

      const stablepoolData = stablepoolsMap.get(assetId)
      const lpAPY = yieldsMap.get(assetId)

      const calculatedData = calculateAssetApyTotals(
        stableSwapAssetIds,
        underlyingReserves,
        assetReserve?.aIncentivesData ?? [],
        new Map(externalApys),
        stablepoolData,
        lpAPY ?? 0,
        getRelatedAToken,
      )

      return {
        assetId,
        incentives,
        lpAPY,
        stablepoolData,
        ...calculatedData,
      } satisfies BorrowAssetApyData
    })
  }, [
    getRelatedAToken,
    assetIdsMemo,
    stablepoolsMap,
    externalApys,
    getAsset,
    getErc20AToken,
    isLoading,
    reserves,
    yieldsMap,
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

type UnderlyingAssetApyDefined = UnderlyingAssetApy & {
  supplyApy: number
  borrowApy: number
}
const hasDefinedApy = (
  assets: UnderlyingAssetApy[],
): assets is UnderlyingAssetApyDefined[] =>
  assets.every((asset) => asset.supplyApy !== null && asset.borrowApy !== null)

const calculateTotalSupplyAndBorrowApy = (
  underlyingAssetsApyData: UnderlyingAssetApy[],
  incentivesNetAPR: number,
  lpAPY: number,
) => {
  if (!hasDefinedApy(underlyingAssetsApyData)) {
    return {
      underlyingSupplyApy: null,
      underlyingBorrowApy: null,
      supplyMMApy: null,
      borrowMMApy: null,
      totalSupplyApy: null,
      totalBorrowApy: null,
    }
  }

  let underlyingSupplyApy: number = 0
  let underlyingBorrowApy: number = 0

  for (const asset of underlyingAssetsApyData) {
    underlyingSupplyApy += asset.supplyApy
    underlyingBorrowApy += asset.borrowApy
  }

  const supplyMMApy = underlyingSupplyApy + incentivesNetAPR
  const borrowMMApy = underlyingBorrowApy + incentivesNetAPR
  const totalSupplyApy = supplyMMApy + lpAPY
  const totalBorrowApy = borrowMMApy + lpAPY

  return {
    underlyingSupplyApy,
    underlyingBorrowApy,
    supplyMMApy,
    borrowMMApy,
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
  | "supplyMMApy"
  | "borrowMMApy"
>

const calculateAssetProportionInStablepool = (
  assetId: string,
  stablepoolData: TStablepoolDetails | undefined,
) => {
  const allReserves = stablepoolData?.reserves ?? []
  const reserve = allReserves.find(
    (reserve) => reserve.asset_id.toString() === assetId,
  )
  const totalAmount = stablepoolData?.totalDisplayAmount
  const reserveAmount = reserve?.displayAmount

  if (totalAmount && reserveAmount) {
    return Big(reserveAmount).div(totalAmount).toNumber()
  }
}
const calculateAssetApyTotals = (
  stableSwapAssetIds: string[],
  underlyingReserves: ComputedReserveData[],
  incentives: ReserveIncentiveResponse[],
  externalApysMap: Map<
    string,
    { apyType: ExternalApyType; apy?: number | null }
  >,
  stablepoolData: TStablepoolDetails | undefined,
  lpAPY: number,
  getRelatedAToken: TAssetsContext["getRelatedAToken"],
): CalculatedAssetApyTotals => {
  const assetCount = stableSwapAssetIds.length
  const incentivesNetAPR = calculateIncentivesNetAPR(incentives)

  const underlyingAssetsApyData = underlyingReserves.map<UnderlyingAssetApy>(
    (reserve) => {
      const id = getAssetIdFromAddress(reserve.underlyingAsset)
      const supplyAPY = Big(reserve.supplyAPY)
      const borrowAPY = Big(reserve.variableBorrowAPY)

      const balanceId = getRelatedAToken(id)?.id ?? id
      const proportion =
        calculateAssetProportionInStablepool(balanceId, stablepoolData) ||
        1 / assetCount

      return {
        id,
        supplyApy: supplyAPY.times(100).times(proportion).toNumber(),
        borrowApy: borrowAPY.times(100).times(proportion).toNumber(),
      }
    },
  )

  for (const id of stableSwapAssetIds) {
    const externalApy = externalApysMap.get(id)

    if (externalApy && externalApy.apy !== undefined) {
      const proportion =
        calculateAssetProportionInStablepool(id, stablepoolData) ||
        1 / assetCount

      const apy =
        externalApy.apy === null
          ? null
          : Big(externalApy.apy).times(proportion).toNumber()

      underlyingAssetsApyData.push({
        id,
        apyType: externalApy.apyType,
        supplyApy: apy,
        borrowApy: apy,
      })
    }
  }

  const apySums = calculateTotalSupplyAndBorrowApy(
    underlyingAssetsApyData,
    incentivesNetAPR,
    lpAPY,
  )

  return {
    ...apySums,
    underlyingAssetsApyData,
    incentivesNetAPR,
  }
}

export const useBorrowClaimableRewards = () => {
  const { data: userBorrowSummary, isLoading } = useUserBorrowSummary()
  const rewards = userBorrowSummary
    ? getUserClaimableRewards(userBorrowSummary)
    : undefined

  return {
    data: rewards,
    isLoading,
  }
}
