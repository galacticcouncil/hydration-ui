import { Flex, SliderTabs } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { FC, useState } from "react"

import { accountOpenGovVotesQuery } from "@/api/democracy"
import i18n from "@/i18n"
import { TwoColumnGrid } from "@/modules/layout/components/TwoColumnGrid"
import { GigaAction } from "@/modules/staking/gigaStaking/GigaAction"
import { GigaStakeTotalsHeader } from "@/modules/staking/gigaStaking/GigaStakeTotalsHeader"
import { GigaStakingDashboard } from "@/modules/staking/gigaStaking/GigaStakingDashboard"
import { OngoingReferenda } from "@/modules/staking/OngoingReferenda"
import { useRpcProvider } from "@/providers/rpcProvider"

const gigaStakingOptions = [
  { id: "dashboard", label: i18n.t("staking:gigaStaking.tabs.mob.dashboard") },
  { id: "actions", label: i18n.t("staking:gigaStaking.tabs.mob.actions") },
]

export const GigaStakePage: FC = () => {
  const rpc = useRpcProvider()
  const { account } = useAccount()
  const address = account?.address ?? ""
  const { isMobile, isTablet } = useBreakpoints()
  const [type, setType] = useState<"dashboard" | "actions">("dashboard")

  const { data: accountVotes, isLoading: votesIsLoading } = useQuery(
    accountOpenGovVotesQuery(rpc, address),
  )

  const votesData = accountVotes?.votes ?? []

  if (isMobile || isTablet) {
    return (
      <Flex direction="column" gap="xl">
        <GigaStakeTotalsHeader />

        <SliderTabs
          options={gigaStakingOptions}
          selected={type}
          onSelect={(option) => setType(option.id as "dashboard" | "actions")}
        />

        {type === "dashboard" ? (
          <Flex direction="column" gap="xl">
            <OngoingReferenda
              votes={votesData}
              isVotesLoading={votesIsLoading}
            />
            <GigaStakingDashboard />
          </Flex>
        ) : (
          <GigaAction />
        )}
      </Flex>
    )
  }

  return (
    <Flex direction="column" gap="xl">
      <GigaStakeTotalsHeader />

      <TwoColumnGrid template="sidebar">
        <GigaStakingDashboard />

        <GigaAction key={address} />
      </TwoColumnGrid>

      <OngoingReferenda votes={votesData} isVotesLoading={votesIsLoading} />
    </Flex>
  )
}
