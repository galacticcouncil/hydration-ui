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
  rewards: FarmDepositReward
  isXyk: boolean
}

export const useOmnipoolFarms = () => {
  const { isApiLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["omnipoolActiveFarms"],
    queryFn: () => sdk.api.farm.getAllOmnipoolFarms(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

export const useIsolatedPoolsFarms = () => {
  const { isApiLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["isolatedPoolsFarms"],
    queryFn: () => sdk.api.farm.getAllIsolatedFarms(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

export const useIsolatedPoolFarms = (address: string) => {
  const { isApiLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["isolatedPoolFarms", address],
    queryFn: async () => {
      const data = await sdk.api.farm.getIsolatedFarms(address)
      return data.filter((farm) => !!farm)
    },
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  return { data, isLoading }
}

export const useOmnipoolActiveFarm = (poolId: string) => {
  const { isApiLoaded, sdk } = useRpcProvider()

  const { data, isLoading } = useQuery({
    queryKey: ["omnipoolActiveFarm", poolId],
    queryFn: async () => {
      const data = await sdk.api.farm.getOmnipoolFarms(poolId)
      return data.filter((farm) => !!farm)
    },
    enabled: isApiLoaded,
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
      if (!depositReward) return null

      return {
        assetId,
        depositId,
        rewards: depositReward,
        isXyk,
      }
    },
  })
}

export const useFarmRewards = (
  positions: Array<XykDeposit | OmnipoolDepositFull>,
  relayBlockChainNumber: number | undefined = 0,
) => {
  const { sdk, isApiLoaded } = useRpcProvider()
  const isPositions = positions.length > 0

  const allEntries = positions.flatMap((position) =>
    position.yield_farm_entries.map((entry) => ({ entry, position })),
  )

  const queries = useQueries({
    queries: allEntries.map(({ entry, position }) => ({
      ...farmRewardsQuery(sdk, entry, position, relayBlockChainNumber),
      enabled:
        isApiLoaded &&
        !!sdk.api.router &&
        isPositions &&
        !!relayBlockChainNumber,
      refetchInterval: 60000,
    })),
  })

  const isLoading = queries.some((query) => query.isLoading)
  const isPending = queries.some((query) => query.isPending)

  const data: FarmRewards[] | undefined = isLoading
    ? undefined
    : queries.map((query) => query.data).filter((data) => !!data)

  const refetch = async () =>
    await Promise.all(queries.map((query) => query.refetch()))

  return { data, isLoading, isPending, refetch }
}
