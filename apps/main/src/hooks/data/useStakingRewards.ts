import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"

import { openGovReferendaQuery } from "@/api/democracy"
import { stakingRewardsQuery } from "@/api/staking"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useStakingRewards = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: openGovReferendas } = useQuery(openGovReferendaQuery(rpc))

  return useQuery({
    ...stakingRewardsQuery(
      rpc,
      address,
      openGovReferendas?.map((referenda) => referenda.id.toString()) ?? [],
    ),
    placeholderData: (prev) => prev,
  })
}
