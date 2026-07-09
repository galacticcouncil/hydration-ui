import { ExternalLinkIcon } from "@galacticcouncil/ui/assets/icons"
import { ExternalLink, Flex, Icon } from "@galacticcouncil/ui/components"
import { basejumpscan, xcscan } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"

import { ClaimButton } from "@/modules/xcm/history/components/ClaimButton"
import { useJourneyClaimable } from "@/modules/xcm/history/hooks/useJourneyClaimable"

export const JourneyActions: React.FC<{ journey: XcJourney }> = ({
  journey,
}) => {
  const { correlationId, originProtocol } = journey
  const link =
    originProtocol === "basejump"
      ? basejumpscan.tx(correlationId)
      : xcscan.tx(correlationId)

  const isClaimable = useJourneyClaimable(journey)

  return (
    <Flex
      gap="base"
      align="center"
      justify="end"
      onClick={(e) => e.stopPropagation()}
    >
      {isClaimable && <ClaimButton journey={journey} />}
      <ExternalLink href={link}>
        <Icon size="m" component={ExternalLinkIcon} />
      </ExternalLink>
    </Flex>
  )
}
