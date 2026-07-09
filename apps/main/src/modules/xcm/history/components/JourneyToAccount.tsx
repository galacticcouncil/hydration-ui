import { Flex } from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"

import { AccountIdentity } from "@/components/AccountIdentity"
import { JourneyChainLogo } from "@/modules/xcm/history/components/JourneyChainLogo"
import { useJourneyAddresses } from "@/modules/xcm/history/hooks/useJourneyAddresses"

export const JourneyToAccount: React.FC<{ journey: XcJourney }> = ({
  journey,
}) => {
  const { to } = useJourneyAddresses(journey)

  return (
    <Flex gap="base" align="center">
      <JourneyChainLogo networkUrn={journey.destination} />
      <AccountIdentity fw={500} color={getToken("text.high")} address={to} />
    </Flex>
  )
}
