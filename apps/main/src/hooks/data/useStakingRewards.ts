import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { bestNumberQuery } from "@/api/chain"
import { openGovReferendaQuery } from "@/api/democracy"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: blockNumber } = useQuery(bestNumberQuery(rpc))

  const { data: openGovReferendas } = useQuery(openGovReferendaQuery(rpc))

  return useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      openGovReferendas?.map((referenda) => referenda.id.toString()) ?? [],
      blockNumber?.parachainBlockNumber ?? 0,
    ),
    placeholderData: (prev) => prev,
  })
}
