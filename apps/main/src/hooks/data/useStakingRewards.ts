import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { bestNumberQuery } from "@/api/chain"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()

  const { data: blockNumber } = useQuery(bestNumberQuery(rpc))

  return useQuery({
    ...stakingRewardsQuery(
      rpc,
      account?.address ?? "",
      blockNumber?.parachainBlockNumber ?? 0,
    ),
    placeholderData: (prev) => prev,
  })
}
