import { farm, SdkCtx } from "@galacticcouncil/sdk-next"
import { queryOptions, useQueries, useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"
import { isXykDepositPosition } from "@/states/account"

import { OmnipoolDepositFull, XykDeposit } from "./account"

export type Farm = farm.Farm
export type FarmDepositReward = farm.FarmDepositReward
export type FarmEntry = OmnipoolDepositFull["yield_farm_entries"][number]
export type LoyaltyCurve = farm.LoyaltyCurve

export type FarmRewards = {
  assetId: string
  depositId: string
  yieldFarmId: number
  rewards: FarmDepositReward
  isActiveFarm: boolean
  isXyk: boolean
}

export const useOmnipoolFarms = () => {
  const { isLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["omnipoolActiveFarms"],
    queryFn: () => sdk.api.farm.getAllOmnipoolFarms(),
    enabled: isLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

export const useIsolatedPoolsFarms = () => {
  const { isLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["isolatedPoolsFarms"],
    queryFn: () => sdk.api.farm.getAllIsolatedFarms(),
    enabled: isLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

export const useOmnipoolActiveFarm = (poolId: string) => {
  const { isLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["omnipoolActiveFarm", poolId],
    queryFn: async () => {
      const data = await sdk.api.farm.getOmnipoolFarms(poolId)
      return data.filter((farm) => !!farm)
    },
    enabled: isLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

const farmRewardsQuery = (
  sdk: SdkCtx,
  entry: FarmEntry,
  position: XykDeposit | OmnipoolDepositFull,
  relayBlockChainNumber: number | undefined = 0,
) => {
  const isXyk = isXykDepositPosition(position)
  const depositId = isXyk ? position.id : position.miningId

  return queryOptions({
    queryKey: [
      isXyk ? "xykFarmRewards" : "omnipoolFarmRewards",
      depositId,
      entry.yield_farm_id,
    ],
    queryFn: async () => {
      const assetId = isXyk ? position.amm_pool_id : position.assetId

      const depositReward = await sdk.api.farm.getDepositReward(
        assetId,
        entry,
        isXyk,
        relayBlockChainNumber,
      )
      if (!depositReward) return undefined

      return {
        assetId,
        depositId,
        yieldFarmId: entry.yield_farm_id,
        rewards: depositReward,
        isActiveFarm: true,
        isXyk,
      }
    },
  })
}

export const useFarmRewards = (
  positions: Array<XykDeposit | OmnipoolDepositFull>,
  relayBlockChainNumber: number | undefined = 0,
) => {
  const { sdk } = useRpcProvider()
  const isPositions = positions.length > 0

  const allEntries = positions.flatMap((position) =>
    position.yield_farm_entries.map((entry) => ({ entry, position })),
  )

  const queries = useQueries({
    queries: allEntries.map(({ entry, position }) => ({
      ...farmRewardsQuery(sdk, entry, position, relayBlockChainNumber),
      enabled: !!sdk.api.router && isPositions && !!relayBlockChainNumber,
      refetchInterval: 60000,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)
  const isPending = queries.some((query) => query.isPending)

  const data: FarmRewards[] | undefined = isLoading
    ? undefined
    : queries.map((query) => query.data).filter((data) => !!data)

  const refetch = () => queries.forEach((query) => query.refetch())

  return { data, isLoading, isPending, refetch }
}
