import { useNow } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { type XcJourney, XcJourneyBuilder } from "@galacticcouncil/xc-scan"
import { useQueries, useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { sortBy } from "remeda"

import { journeyRedeemedQuery } from "@/modules/xcm/history/hooks/useJourneyRedeemed"
import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import {
  getClaimableJourneys,
  isJourneyAwaitingMinAge,
} from "@/modules/xcm/history/utils/claim"
import { journeyDate } from "@/modules/xcm/history/utils/journey"
import { xcScanHttpClient } from "@/modules/xcm/history/xcScanStore"

const useClaimableBackfill = (address: string) => {
  return useQuery({
    queryKey: ["xcscan", "claimable-backfill", address],
    enabled: !!address,
    refetchOnWindowFocus: true,
    retry: false,
    staleTime: minutesToMilliseconds(5),
    queryFn: async () => {
      const req = XcJourneyBuilder.journeys()
        .address(address)
        .status(["waiting"])
        .build({ validate: true })

      const res = await xcScanHttpClient.queryCrosschain(req, { limit: 100 })
      return res.items
    },
  })
}

export const useClaimableTransactions = () => {
  const { account } = useAccount()
  const address = account?.address ?? ""

  const { data: xcscanJourneys = [] } = useXcScan(address)
  const { data: claimableBackfill = [] } = useClaimableBackfill(address)

  const { pendingCorrelationIds } = usePendingClaimsStore()

  const sources = useMemo(
    () => [...xcscanJourneys, ...claimableBackfill],
    [xcscanJourneys, claimableBackfill],
  )

  const shouldPoll = sources.some(isJourneyAwaitingMinAge)
  const now = useNow(shouldPoll ? 5000 : null)

  const claimableCandidates = useMemo(() => {
    const byCorrelationId = new Map<string, XcJourney>()
    const nowMs = now.getTime()
    for (const journey of getClaimableJourneys(claimableBackfill, nowMs)) {
      byCorrelationId.set(journey.correlationId, journey)
    }
    for (const journey of getClaimableJourneys(xcscanJourneys, nowMs)) {
      byCorrelationId.set(journey.correlationId, journey)
    }

    return sortBy([...byCorrelationId.values()], [journeyDate, "desc"])
  }, [claimableBackfill, now, xcscanJourneys])

  const redeemedResults = useQueries({
    queries: claimableCandidates.map(journeyRedeemedQuery),
  })

  return useMemo(() => {
    const pending = new Set(pendingCorrelationIds)
    return claimableCandidates.filter((journey, index) => {
      if (pending.has(journey.correlationId)) return false
      return redeemedResults[index]?.data !== true
    })
  }, [claimableCandidates, pendingCorrelationIds, redeemedResults])
}
