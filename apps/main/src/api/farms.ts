import { farm } from "@galacticcouncil/sdk-next"
import { useQuery } from "@tanstack/react-query"

import { useRpcProvider } from "@/providers/rpcProvider"

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
