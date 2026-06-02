import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { bestNumberQuery } from "@/api/chain"
import { ongoingReferendaQuery } from "@/api/democracy"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: blockNumber } = useQuery(bestNumberQuery(rpc))

  const { data: ongoingReferenda } = useQuery(ongoingReferendaQuery(rpc))

  return useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      ongoingReferenda?.map((referenda) => referenda.id.toString()) ?? [],
      blockNumber?.parachainBlockNumber ?? 0,
    ),
    placeholderData: (prev) => prev,
  })
}
