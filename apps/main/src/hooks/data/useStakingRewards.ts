import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  return useQuery(stakingRewardsQuery(rpc, account?.address ?? ""))
}
