import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"

import { isJourneyRedeemed } from "@/modules/xcm/history/utils/claim"

export const useJourneyRedeemed = (journey: XcJourney) => {
  return useQuery({
    queryKey: ["xcm", "claim", "redeemed", journey.correlationId],
    queryFn: () => isJourneyRedeemed(journey),
    staleTime: minutesToMilliseconds(1),
  })
}
