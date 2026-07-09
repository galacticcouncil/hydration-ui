import { TextProps } from "@galacticcouncil/ui/components"
import type { XcJourney } from "@galacticcouncil/xc-scan"

import { JourneyStatus } from "@/modules/xcm/history/components/JourneyStatus"
import { useJourneyDisplayStatus } from "@/modules/xcm/history/hooks/useJourneyClaimable"

export type JourneyDisplayStatusProps = TextProps & {
  journey: XcJourney
}

export const JourneyDisplayStatus: React.FC<JourneyDisplayStatusProps> = ({
  journey,
  ...props
}) => {
  const status = useJourneyDisplayStatus(journey)
  return <JourneyStatus status={status} {...props} />
}
