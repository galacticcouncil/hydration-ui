import { Flex } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"

import { accountOpenGovVotesQuery } from "@/api/democracy"
import { GovernanceTotalsHeader } from "@/modules/governance/GovernanceTotalsHeader"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { useRpcProvider } from "@/providers/rpcProvider"

export const GovernancePage: FC = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: accountVotes, isLoading: votesIsLoading } = useQuery(
    accountOpenGovVotesQuery(rpc, address),
  )

  const votesData = accountVotes?.votes ?? []

  return (
    <Flex direction="column" gap="xl">
      <GovernanceTotalsHeader
        votesCount={votesData.length}
        isVotesLoading={votesIsLoading}
      />
      <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
    </Flex>
  )
}
