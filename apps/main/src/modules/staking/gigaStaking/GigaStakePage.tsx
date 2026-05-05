import { Flex, SectionHeader } from "@galacticcouncil/ui/components"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { accountOpenGovVotesQuery } from "@/api/democracy"
import { GigaStakeTotalsHeader } from "@/modules/staking/gigaStaking/GigaStakeTotalsHeader"
import { GigaStakingDashboard } from "@/modules/staking/gigaStaking/GigaStakingDashboard"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { useRpcProvider } from "@/providers/rpcProvider"

export const GigaStakePage: FC = () => {
  const { t } = useTranslation("staking")
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: accountVotes, isLoading: votesIsLoading } = useQuery(
    accountOpenGovVotesQuery(rpc, address),
  )

  const votesData = accountVotes?.votes ?? []

  return (
    <Flex direction="column" gap="xl">
      <GigaStakeTotalsHeader />

      <SectionHeader
        title={t("gigaStake.section.gigaStakingDashboard")}
        hasDescription
        noTopPadding
      />

      <GigaStakingDashboard />

      <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
    </Flex>
  )
}
