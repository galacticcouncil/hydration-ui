import { createQueryString, safeConvertAnyToH160 } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"
import { isNonNullish, sortBy } from "remeda"

import { BasejumpScanSseClient } from "@/modules/xcm/history/lib/BasejumpScanSseClient"
import {
  basejumpItemToXcJourney,
  basejumpScanSchema,
} from "@/modules/xcm/history/utils/bjscan"
import { removeOptimisticJourney } from "@/modules/xcm/history/utils/optimistic"

const BJSCAN_API_BASE_URL = "https://bjscan-api.play.hydration.cloud"
const BJSCAN_TRANSFERS_URL = `${BJSCAN_API_BASE_URL}/api/transfers`

export const bjscan = new BasejumpScanSseClient(BJSCAN_API_BASE_URL)

export const createBasejumpScanQueryKey = (address: string) => [
  "bjscan",
  address,
]

export const useBasejumpScan = (address: string) => {
  return useQuery({
    queryKey: createBasejumpScanQueryKey(address),
    queryFn: async () => {
      const res = await fetch(
        `${BJSCAN_TRANSFERS_URL}${createQueryString({
          address: safeConvertAnyToH160(address),
        })}`,
      )

      if (!res.ok) {
        throw new Error(
          `BasejumpScan API error: ${res.status} ${res.statusText}`,
        )
      }

      const data = await res.json()
      const parsed = basejumpScanSchema.parse(data)
      return parsed.items.map(basejumpItemToXcJourney).filter(isNonNullish)
    },
    enabled: !!address,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    retry: false,
  })
}

const journeyDate = (j: XcJourney) => j.sentAt ?? j.createdAt ?? 0

function upsertBasejumpJourneyInCache(
  prev: XcJourney[] | undefined,
  journey: XcJourney,
): XcJourney[] {
  const list = prev ?? []
  const filtered = list.filter(
    (j) =>
      j.originTxPrimary !== journey.originTxPrimary &&
      j.correlationId !== journey.correlationId,
  )
  return sortBy([...filtered, journey], [journeyDate, "desc"])
}

export const useBasejumpScanSubscription = (address: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!address) return

    bjscan.subscribe(address, {
      onCreate(transfer) {
        const journey = basejumpItemToXcJourney(transfer)
        if (!journey) return

        const queryKey = createBasejumpScanQueryKey(address)
        if (transfer.initiated?.txHash) {
          removeOptimisticJourney(
            queryClient,
            address,
            transfer.initiated.txHash,
          )
        }
        queryClient.setQueryData<XcJourney[]>(queryKey, (old) =>
          upsertBasejumpJourneyInCache(old, journey),
        )
      },
      onUpdate(transfer) {
        const journey = basejumpItemToXcJourney(transfer)
        if (!journey) return

        const queryKey = createBasejumpScanQueryKey(address)
        queryClient.setQueryData<XcJourney[]>(queryKey, (old) => {
          const prev = old ?? []

          const exists = prev.some(
            (j) => j.correlationId === journey.correlationId,
          )

          if (!exists) {
            return upsertBasejumpJourneyInCache(prev, journey)
          }

          return prev.map((j) =>
            j.correlationId === journey.correlationId ? journey : j,
          )
        })
      },
    })

    return () => {
      bjscan.unsubscribe()
    }
  }, [address, queryClient])
}
