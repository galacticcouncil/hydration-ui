import { useAccount } from "@galacticcouncil/web3-connect"
import { type XcJourney, XcJourneyBuilder } from "@galacticcouncil/xc-scan"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { sortBy } from "remeda"

import { usePendingClaimsStore } from "@/modules/xcm/history/hooks/usePendingClaimsStore"
import { useXcScan } from "@/modules/xcm/history/useXcScan"
import { getClaimableJourneys } from "@/modules/xcm/history/utils/claim"
import { journeyDate } from "@/modules/xcm/history/utils/journey"
import { xcScanHttpClient } from "@/modules/xcm/history/xcScanStore"

const useClaimableBackfill = (address: string) => {
  return useQuery({
    queryKey: ["xcscan", "claimable-backfill", address],
    enabled: !!address,
    refetchOnWindowFocus: true,
    retry: false,
    select: getClaimableJourneys,
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

  const { data: claimable } = useXcScan(address, {
    claimableOnly: true,
  })
  const { data: claimableBackfill } = useClaimableBackfill(address)

  const { pendingCorrelationIds } = usePendingClaimsStore()

  return useMemo(() => {
    const byCorrelationId = new Map<string, XcJourney>()
    for (const journey of claimableBackfill ?? []) {
      byCorrelationId.set(journey.correlationId, journey)
    }
    for (const journey of claimable) {
      byCorrelationId.set(journey.correlationId, journey)
    }

    const merged = sortBy([...byCorrelationId.values()], [journeyDate, "desc"])

    const pending = new Set(pendingCorrelationIds)
    return merged.filter(({ correlationId }) => !pending.has(correlationId))
  }, [claimable, claimableBackfill, pendingCorrelationIds])
}
