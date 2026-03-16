import {
  SquidSdk,
  stablepoolYieldMetricsQuery,
} from "@galacticcouncil/indexer/squid"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ReserveIncentiveResponse } from "@galacticcouncil/money-market/types"
import { getUserClaimableRewards } from "@galacticcouncil/money-market/utils"
import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
} from "@galacticcouncil/utils"
import {
  QueryClient,
  queryOptions,
  useQueries,
  useQueryClient,
} from "@tanstack/react-query"
import Big from "big.js"

import {
  borrowReservesQuery,
  ExternalApyType,
  useUserBorrowSummary,
} from "@/api/borrow/queries"
import { useBlockTimestamp } from "@/api/chain"
import {
  ASSET_ID_TO_DEFILLAMA_ID,
  defillamaLatestApyQuery,
} from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID, kaminoApyQuery } from "@/api/external/kamino"
import { useSquidClient } from "@/api/provider"
import { stablepoolReservesQuery, type TReserve } from "@/api/stableswap"
import {
  isStableSwap,
  TAssetsContext,
  useAssets,
} from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

type UnderlyingAssetApy = {
  id: string
  apyType?: ExternalApyType
  supplyApy: number
  borrowApy: number
}

export type ApyType = "supply" | "borrow"
export type BorrowAssetApyData = {
  assetId: string
  lpAPY?: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsApyData: UnderlyingAssetApy[]
  underlyingSupplyApy: number
  underlyingBorrowApy: number
  totalSupplyApy: number
  totalBorrowApy: number
  supplyMMApy: number
  borrowMMApy: number
}

const getExternalIncentives = async (
  queryClient: QueryClient,
  assetsIds: string[],
  reserves?: TReserve[],
) => {
  const externalApysQueries: [
    string,
    { apyType: ExternalApyType; apy: number },
  ][] = []

  for (const assetId of assetsIds) {
    const defillamaId = ASSET_ID_TO_DEFILLAMA_ID[assetId]
    if (defillamaId) {
      const apy = await queryClient.ensureQueryData(
        defillamaLatestApyQuery(defillamaId),
      )

      if (apy) {
        externalApysQueries.push([
          assetId,
          {
            apyType: ExternalApyType.stake,
            apy,
          },
        ])
      }
    }
    const kaminoId = ASSET_ID_TO_KAMINO_ID[assetId]
    if (kaminoId) {
      const apy = await queryClient.ensureQueryData(kaminoApyQuery(kaminoId))

      if (apy) {
        externalApysQueries.push([
          assetId,
          {
            apyType: ExternalApyType.nativeYield,
            apy,
          },
        ])
      }
    }
  }

  const data = await Promise.all(externalApysQueries)

  return data.map(([id, { apyType, apy }]) => {
    const proportion =
      reserves?.find((reserve) => reserve.asset_id.toString() === id)
        ?.proportion || 1 / assetsIds.length

    return {
      id,
      apyType,
      supplyApy: Big(apy).times(proportion).toNumber(),
      borrowApy: Big(apy).times(proportion).toNumber(),
    }
  })
}

export const borrowAssetApyQuery = (
  rpc: TProviderContext,
  queryClient: QueryClient,
  squidClient: SquidSdk,
  assetId: string,
  getAssetWithFallback: TAssetsContext["getAssetWithFallback"],
  getErc20AToken: TAssetsContext["getErc20AToken"],
  getRelatedAToken: TAssetsContext["getRelatedAToken"],
  timestamp: bigint | undefined,
) => {
  return queryOptions<BorrowAssetApyData | undefined>({
    queryKey: ["borrowAssetApy", assetId],
    queryFn: async () => {
      if (!timestamp) throw new Error("Invalid timestamp")

      const borrowReserves = await queryClient.ensureQueryData(
        borrowReservesQuery(rpc, queryClient, timestamp),
      )

      const assetReserve = borrowReserves?.formattedReserves.find(
        ({ underlyingAsset }) =>
          underlyingAsset === getAddressFromAssetId(assetId),
      )

      if (!assetReserve) return undefined

      const meta = getAssetWithFallback(assetId)
      const incentives =
        assetReserve.aIncentivesData?.filter(({ incentiveAPR }) =>
          Big(incentiveAPR).gt(0),
        ) ?? []

      if (isStableSwap(meta)) {
        const stableSwapUnderlyingAssetIds: string[] =
          meta.underlyingAssetId ?? []

        const underlyingAssetIds = stableSwapUnderlyingAssetIds.map(
          (assetId) => getErc20AToken(assetId)?.underlyingAssetId ?? assetId,
        )

        const underlyingReserves = borrowReserves?.formattedReserves.filter(
          (reserve) => {
            return underlyingAssetIds
              .map(getAddressFromAssetId)
              .includes(reserve.underlyingAsset)
          },
        )

        const yieldMetrics = await queryClient.ensureQueryData(
          stablepoolYieldMetricsQuery(squidClient),
        )

        const stableswapApy = Number(
          yieldMetrics?.find((metric) => metric.poolId === assetId)
            ?.projectedApyPerc ?? 0,
        )

        const stablepoolData = await queryClient.ensureQueryData(
          stablepoolReservesQuery(
            rpc,
            queryClient,
            assetId,
            getAssetWithFallback,
          ),
        )

        if (!stablepoolData) {
          throw new Error("Stablepool reserves not found")
        }

        const externalIncentives = await getExternalIncentives(
          queryClient,
          stableSwapUnderlyingAssetIds,
          stablepoolData.reserves,
        )

        const calculatedData = calculateAssetApyTotals({
          underlyingReserves,
          incentives: assetReserve?.aIncentivesData ?? [],
          getRelatedAToken,
          externalIncentives,
          stableswapYield: stableswapApy,
          stableswapReserves: stablepoolData.reserves,
        })

        return {
          assetId,
          incentives,
          lpAPY: stableswapApy,
          ...calculatedData,
        } satisfies BorrowAssetApyData
      } else {
        const underlyingAssetIds = [assetId]
        const underlyingReserves = borrowReserves?.formattedReserves.filter(
          (reserve) => {
            return underlyingAssetIds
              .map(getAddressFromAssetId)
              .includes(reserve.underlyingAsset)
          },
        )
        const externalIncentives = await getExternalIncentives(queryClient, [
          assetId,
        ])

        const calculatedData = calculateAssetApyTotals({
          underlyingReserves,
          incentives: assetReserve?.aIncentivesData ?? [],
          getRelatedAToken,
          externalIncentives,
        })

        return {
          assetId,
          incentives,
          ...calculatedData,
        } satisfies BorrowAssetApyData
      }
    },
  })
}

export const useBorrowAssetsApy = (assetIds: string[]) => {
  const { getAssetWithFallback, getErc20AToken, getRelatedAToken } = useAssets()
  const rpc = useRpcProvider()
  const queryClient = useQueryClient()
  const squidClient = useSquidClient()

  const { data: timestamp } = useBlockTimestamp()

  return useQueries({
    queries: assetIds.map((assetId) => ({
      ...borrowAssetApyQuery(
        rpc,
        queryClient,
        squidClient,
        assetId,
        getAssetWithFallback,
        getErc20AToken,
        getRelatedAToken,
        timestamp,
      ),
    })),
    combine: (results) => {
      const data: BorrowAssetApyData[] = results
        .map((result) => result.data)
        .filter((result) => !!result)
      const isLoading = results.some((result) => result.isLoading)

      return { data, isLoading }
    },
  })
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
  stableswapYield?: number,
) => {
  const underlyingSupplyApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.supplyApy,
    0,
  )

  const underlyingBorrowApy = underlyingAssetsApyData.reduce(
    (total, asset) => total + asset.borrowApy,
    0,
  )

  const supplyMMApy = underlyingSupplyApy + incentivesNetAPR
  const borrowMMApy = underlyingBorrowApy + incentivesNetAPR
  const totalSupplyApy = supplyMMApy + (stableswapYield ?? 0)
  const totalBorrowApy = borrowMMApy + (stableswapYield ?? 0)

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

export const calculateAssetApyTotals = ({
  underlyingReserves,
  incentives,
  getRelatedAToken,
  externalIncentives,
  stableswapYield,
  stableswapReserves,
}: {
  underlyingReserves: ComputedReserveData[]
  incentives: ReserveIncentiveResponse[]
  getRelatedAToken: TAssetsContext["getRelatedAToken"]
  externalIncentives: UnderlyingAssetApy[]
  stableswapYield?: number
  stableswapReserves?: TReserve[]
}): CalculatedAssetApyTotals => {
  const incentivesNetAPR = calculateIncentivesNetAPR(incentives)

  const underlyingAssetsApyData = underlyingReserves.map<UnderlyingAssetApy>(
    (reserve) => {
      const id = getAssetIdFromAddress(reserve.underlyingAsset)
      const supplyAPY = Big(reserve.supplyAPY)
      const borrowAPY = Big(reserve.variableBorrowAPY)

      const balanceId = getRelatedAToken(id)?.id ?? id
      const proportion = stableswapReserves
        ? stableswapReserves.find(
            (reserve) => reserve.asset_id.toString() === balanceId,
          )?.proportion || 1 / stableswapReserves.length
        : 1

      return {
        id,
        supplyApy: supplyAPY.times(100).times(proportion).toNumber(),
        borrowApy: borrowAPY.times(100).times(proportion).toNumber(),
      }
    },
  )

  underlyingAssetsApyData.push(...externalIncentives)

  const apySums = calculateTotalSupplyAndBorrowApy(
    underlyingAssetsApyData,
    incentivesNetAPR,
    stableswapYield,
  )

  return {
    ...apySums,
    underlyingAssetsApyData,
    incentivesNetAPR,
  }
}
