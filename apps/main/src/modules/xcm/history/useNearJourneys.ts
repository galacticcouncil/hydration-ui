import { wormholescan } from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { minutesToMilliseconds, secondsToMilliseconds } from "date-fns"
import { useMemo } from "react"
import { isNonNullish, sortBy } from "remeda"
import z from "zod"

import { journeyRedeemedQuery } from "@/modules/xcm/history/hooks/useJourneyRedeemed"
import { journeyDate } from "@/modules/xcm/history/utils/journey"
import {
  getNearNttSources,
  toNearNttJourney,
  toNearNttParty,
} from "@/modules/xcm/history/utils/nearNtt"

// Newest first; a claim stays open two weeks, well inside a page
const PAGE_SIZE = 50

const wormholescanVaasSchema = z.object({
  data: z.array(
    z.object({
      sequence: z.number(),
      vaa: z.string(),
      guardianSetIndex: z.number(),
      isDuplicated: z.boolean().optional(),
    }),
  ),
})

/**
 * An account's NEAR ntt transfers, read from the vaas on Wormholescan.
 *
 * xc-scan indexes no NEAR journeys yet, so this stands in until it does.
 */
export const useNearJourneys = (address: string) => {
  const queryClient = useQueryClient()
  const party = useMemo(() => toNearNttParty(address), [address])

  return useQuery({
    queryKey: ["wormholescan", "near", address],
    enabled: !!party,
    staleTime: secondsToMilliseconds(30),
    // No stream to follow, so a transfer is polled until it arrives
    refetchInterval: minutesToMilliseconds(1),
    queryFn: async (): Promise<XcJourney[]> => {
      if (!party) return []

      const lists = await Promise.all(
        getNearNttSources().map(async (source) => {
          const res = await fetch(
            wormholescan.api(`vaas/${source.emitterChain}/${source.emitter}`, {
              page: 0,
              pageSize: PAGE_SIZE,
            }),
          )

          if (!res.ok) {
            throw new Error(
              `Wormholescan API error: ${res.status} ${res.statusText}`,
            )
          }

          const { data } = wormholescanVaasSchema.parse(await res.json())
          return data
            .map((vaa) => toNearNttJourney(vaa, source, { address, party }))
            .filter(isNonNullish)
        }),
      )

      // Only the destination knows of a redeem, asked through the query the
      // claim list shares; a check that fails leaves the claim offered
      const journeys = await Promise.all(
        lists.flat().map(async (journey) => {
          const isRedeemed = await queryClient
            .fetchQuery(journeyRedeemedQuery(journey))
            .catch(() => false)
          return isRedeemed ? { ...journey, status: "received" } : journey
        }),
      )

      return sortBy(journeys, [journeyDate, "desc"])
    },
  })
}
