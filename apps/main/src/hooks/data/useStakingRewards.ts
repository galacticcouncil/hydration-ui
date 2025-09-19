import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { bestNumberQuery } from "@/api/chain"
import { accountOpenGovVotesQuery } from "@/api/democracy"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: blockNumber } = useQuery(bestNumberQuery(rpc))

  const { data: votesData, isSuccess: votesIsSuccess } = useQuery(
    accountOpenGovVotesQuery(rpc, address),
  )

  const activeReferendaIds =
    votesData?.map((referenda) => referenda.id.toString()) ?? []

  return useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      activeReferendaIds,
      blockNumber?.parachainBlockNumber ?? 0,
    ),
    placeholderData: (prev) => prev,
    enabled: votesIsSuccess,
  })
}
