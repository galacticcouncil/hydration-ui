import { XcJourney } from "@galacticcouncil/xc-scan"
import { WormholeScan } from "@galacticcouncil/xc-sdk"
import { queryOptions, useQuery } from "@tanstack/react-query"
import { secondsToMilliseconds } from "date-fns"

import {
  isClaimPending,
  usePendingClaimsStore,
} from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import {
  getJourneyVaaHeader,
  isJourneyClaimable,
} from "@/modules/xcm/history/utils/claim"
import {
  TJourneyStatus,
  WAITING_STATUSES,
} from "@/modules/xcm/history/utils/journey"

const whScan = new WormholeScan()

/**
 * Whether the journey's VAA was already redeemed on the destination
 * chain, straight from Wormholescan. The journey status from xcscan can
 * lag behind the actual redeem, so it cannot be trusted alone.
 */
export const vaaRedeemedQuery = (journey: XcJourney) => {
  const header = getJourneyVaaHeader(journey)
  const vaaId = header
    ? [header.emitterChain, header.emitterAddress, header.sequence].join("/")
    : ""

  return queryOptions({
    queryKey: ["wormhole", "vaaRedeemed", vaaId],
    enabled: !!vaaId,
    staleTime: secondsToMilliseconds(30),
    queryFn: async (): Promise<boolean> => {
      const operation = await whScan.getOperation(vaaId)
      return !!operation?.targetChain
    },
  })
}

/**
 * Journey status for display. xcscan may keep reporting "waiting" after
 * the VAA was redeemed - show such journeys as completed.
 */
export function useJourneyDisplayStatus(journey: XcJourney): TJourneyStatus {
  const isWaiting = WAITING_STATUSES.includes(journey.status)

  const { data: isRedeemed } = useQuery({
    ...vaaRedeemedQuery(journey),
    enabled: isWaiting,
  })

  return isWaiting && isRedeemed ? "completed" : journey.status
}

export function useJourneyClaimable(journey: XcJourney) {
  const { pendingClaims } = usePendingClaimsStore()

  const claimable = isJourneyClaimable(journey)

  const { data: isRedeemed, isError } = useQuery({
    ...vaaRedeemedQuery(journey),
    enabled: claimable,
  })

  // when the redeem status cannot be fetched, fall back to showing the
  // claim - a redeemed VAA claim attempt fails harmlessly on-chain
  const isUnredeemed = isRedeemed === false || isError

  return (
    claimable &&
    isUnredeemed &&
    !isClaimPending(pendingClaims, journey.correlationId)
  )
}
