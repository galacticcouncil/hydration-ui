import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const stakingRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  address: string,
) => {
  return queryOptions({
    queryKey: ["staking", "rewards", address],
    queryFn: () => sdk.api.staking.getRewards(address),
    enabled: isApiLoaded && !!address,
  })
}
