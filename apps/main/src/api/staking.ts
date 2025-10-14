import { queryOptions } from "@tanstack/react-query"

import { TProviderContext } from "@/providers/rpcProvider"

export const stakingRewardsQuery = (
  { sdk, isApiLoaded }: TProviderContext,
  address: string,
  blockNumber: number,
) => {
  return queryOptions({
    queryKey: ["staking", "rewards", address, blockNumber],
    queryFn: () =>
      sdk.api.staking.getRewards(address, [], blockNumber.toString()),
    enabled: isApiLoaded && !!address && !!blockNumber,
  })
}
