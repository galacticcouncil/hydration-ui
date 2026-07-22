import {
  SquidSdk,
  stablepoolYieldMetricsQuery,
} from "@galacticcouncil/indexer/squid"
import { ComputedReserveData } from "@galacticcouncil/money-market/hooks"
import { ReserveIncentiveResponse } from "@galacticcouncil/money-market/types"
import {
  getUserClaimableRewards,
  Pool,
  UiIncentiveDataProvider,
  UiPoolDataProvider,
} from "@galacticcouncil/money-market/utils"
import {
  getAddressFromAssetId,
  getAssetIdFromAddress,
  useStableArray,
} from "@galacticcouncil/utils"
import { QueryClient, queryOptions, useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { constants, Contract } from "ethers"
import { useCallback, useMemo } from "react"

import {
  borrowReservesQuery,
  convertEvmTxRawToPapiTx,
  ExternalApyType,
  lendingPoolAddressProvider,
  useBorrowReserves,
  useExternalApys,
  useUserBorrowSummary,
} from "@/api/borrow/queries"
import {
  ASSET_ID_TO_DEFILLAMA_ID,
  defillamaLatestApyQuery,
} from "@/api/external/defillama"
import { ASSET_ID_TO_KAMINO_ID, kaminoApyQuery } from "@/api/external/kamino"
import { useSquidClient } from "@/api/provider"
import {
  stablepoolReservesQuery,
  type TReserve,
  type TStablepoolDetails,
} from "@/api/stableswap"
import { useStablepoolsReserves } from "@/modules/liquidity/Liquidity.utils"
import {
  isStableSwap,
  TAssetsContext,
  useAssets,
} from "@/providers/assetsProvider"
import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"

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

// Self-contained per-asset APY query used by `useStrategyPositions`
// (multiply/looping). Kept separate from `useBorrowAssetsApy` above, which is a
// synchronous hook and therefore cannot be consumed inside a query function.
type StrategyUnderlyingApy = {
  id: string
  apyType?: ExternalApyType
  supplyApy: number
  borrowApy: number
}

export type StrategyAssetApyData = {
  assetId: string
  lpAPY?: number
  incentivesNetAPR: number
  incentives: ReserveIncentiveResponse[]
  underlyingAssetsApyData: StrategyUnderlyingApy[]
  underlyingSupplyApy: number
  underlyingBorrowApy: number
  totalSupplyApy: number
  totalBorrowApy: number
  supplyMMApy: number
  borrowMMApy: number
}

type StrategyCalculatedApyTotals = Pick<
  StrategyAssetApyData,
  | "totalSupplyApy"
  | "totalBorrowApy"
  | "underlyingBorrowApy"
  | "underlyingSupplyApy"
  | "underlyingAssetsApyData"
  | "incentivesNetAPR"
  | "supplyMMApy"
  | "borrowMMApy"
>

const getExternalIncentives = async (
  queryClient: QueryClient,
  assetsIds: string[],
  indexerUrl: string,
  reserves?: TReserve[],
): Promise<StrategyUnderlyingApy[]> => {
  const externalApysQueries: [
    string,
    { apyType: ExternalApyType; apy: number },
  ][] = []

  for (const assetId of assetsIds) {
    const defillamaId = ASSET_ID_TO_DEFILLAMA_ID[assetId]
    if (defillamaId) {
      const apy = await queryClient.ensureQueryData(
        defillamaLatestApyQuery(defillamaId, indexerUrl),
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
      const apy = await queryClient.ensureQueryData(
        kaminoApyQuery(kaminoId, indexerUrl),
      )

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

const calculateStrategyTotalApy = (
  underlyingAssetsApyData: StrategyUnderlyingApy[],
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

const calculateStrategyAssetApyTotals = ({
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
  externalIncentives: StrategyUnderlyingApy[]
  stableswapYield?: number
  stableswapReserves?: TReserve[]
}): StrategyCalculatedApyTotals => {
  const incentivesNetAPR = calculateIncentivesNetAPR(incentives)

  const underlyingAssetsApyData = underlyingReserves.map<StrategyUnderlyingApy>(
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

  const apySums = calculateStrategyTotalApy(
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

export const borrowAssetApyQuery = (
  rpc: TProviderContext,
  poolDataContract: UiPoolDataProvider | null,
  incentivesContract: UiIncentiveDataProvider | null,
  queryClient: QueryClient,
  squidClient: SquidSdk,
  indexerUrl: string,
  assetId: string,
  getAssetWithFallback: TAssetsContext["getAssetWithFallback"],
  getErc20AToken: TAssetsContext["getErc20AToken"],
  getRelatedAToken: TAssetsContext["getRelatedAToken"],
  timestamp: bigint | undefined,
) => {
  return queryOptions<StrategyAssetApyData | undefined>({
    queryKey: ["borrowAssetApy", assetId],
    enabled: !!timestamp,
    queryFn: async () => {
      if (!timestamp) throw new Error("Invalid timestamp")

      const borrowReserves = await queryClient.ensureQueryData(
        borrowReservesQuery(
          rpc,
          lendingPoolAddressProvider,
          poolDataContract,
          incentivesContract,
        ),
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
          indexerUrl,
          stablepoolData.reserves,
        )

        const calculatedData = calculateStrategyAssetApyTotals({
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
        } satisfies StrategyAssetApyData
      } else {
        const underlyingAssetIds = [assetId]
        const underlyingReserves = borrowReserves?.formattedReserves.filter(
          (reserve) => {
            return underlyingAssetIds
              .map(getAddressFromAssetId)
              .includes(reserve.underlyingAsset)
          },
        )
        const externalIncentives = await getExternalIncentives(
          queryClient,
          [assetId],
          indexerUrl,
        )

        const calculatedData = calculateStrategyAssetApyTotals({
          underlyingReserves,
          incentives: assetReserve?.aIncentivesData ?? [],
          getRelatedAToken,
          externalIncentives,
        })

        return {
          assetId,
          incentives,
          ...calculatedData,
        } satisfies StrategyAssetApyData
      }
    },
  })
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

const ERC20_APPROVE_ABI = [
  "function approve(address spender,uint256 amount) returns (bool)",
] as const

export const useApproveErc20 = () => {
  const provider = useRpcProvider()

  return useCallback(
    async (pool: Pool, tokenAddress: string, evmAddress: string) => {
      const spender = pool.poolAddress as `0x${string}`
      const poolInstance = pool.getContractInstance(pool.poolAddress)

      const erc20Contract = new Contract(
        tokenAddress,
        ERC20_APPROVE_ABI,
        poolInstance.provider,
      )

      const populateApproveTx = erc20Contract.populateTransaction["approve"]

      if (!populateApproveTx) {
        throw new Error("Token approve method is unavailable")
      }

      const approveTxRaw = await populateApproveTx(
        spender,
        constants.MaxUint256.toString(),
      )

      const approveEvmCall = await convertEvmTxRawToPapiTx(
        provider,
        approveTxRaw,
        evmAddress,
      )
      return approveEvmCall
    },
    [provider],
  )
}

const ERC20_ALLOWANCE_ABI = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const

export const useErc20Allowance = () => {
  const provider = useRpcProvider()

  return useCallback(
    async (tokenAddress: string, evmAddress: string, spender: string) => {
      return await provider.evm.readContract({
        abi: ERC20_ALLOWANCE_ABI,
        address: tokenAddress as `0x${string}`,
        functionName: "allowance",
        args: [evmAddress as `0x${string}`, spender as `0x${string}`],
      })
    },
    [provider],
  )
}
