import { farm } from "@galacticcouncil/sdk-next"
import { queryOptions, useQuery } from "@tanstack/react-query"

import { TProviderContext, useRpcProvider } from "@/providers/rpcProvider"
import { Positions } from "@/states/account"

export type Farm = farm.Farm
export type LoyaltyCurve = farm.LoyaltyCurve

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

export const allDepositsRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  accountId: string,
  positions: Positions,
  relayBlockChainNumber: number,
  isEnabled: boolean,
) =>
  queryOptions({
    queryKey: ["farmRewards", accountId],
    queryFn: () => {
      const allDeposits = positions.xykMining
        .map(
          (deposit) =>
            [
              deposit.amm_pool_id.toString(),
              true as boolean,
              deposit.yield_farm_entries,
            ] as const,
        )
        .concat(
          positions.omnipoolMining.map(
            (deposit) =>
              [deposit.assetId, false, deposit.yield_farm_entries] as const,
          ),
        )

      return Promise.all(
        allDeposits.flatMap(([poolId, isXyk, yield_farm_entries]) =>
          yield_farm_entries.map((farmEntry) =>
            sdk.api.farm.getDepositReward(
              poolId,
              farmEntry,
              isXyk,
              relayBlockChainNumber,
            ),
          ),
        ),
      )
    },
    enabled: isEnabled && isApiLoaded && !!relayBlockChainNumber && !!accountId,
  })
