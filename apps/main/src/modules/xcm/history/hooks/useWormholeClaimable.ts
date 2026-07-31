import {
  safeConvertAnyToH160,
  stringEquals,
  wormholescan,
} from "@galacticcouncil/utils"
import type { XcJourney } from "@galacticcouncil/xc-scan"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"

import {
  wormholeOperationsSchema,
  wormholeOpToXcJourney,
} from "@/modules/xcm/history/utils/wormhole"

const HYDRATION_WORMHOLE_CHAIN_ID = 73
const WORMHOLE_PAGE_SIZE = 100
const WORMHOLE_MAX_PAGES = 10

async function fetchWormholeOperations(query: Record<string, string | number>) {
  const operations: unknown[] = []

  for (let page = 0; page < WORMHOLE_MAX_PAGES; page++) {
    const res = await fetch(
      wormholescan.api("operations", {
        ...query,
        page,
        pageSize: WORMHOLE_PAGE_SIZE,
      }),
    )

    if (!res.ok) {
      throw new Error(`WormholeScan API error: ${res.status} ${res.statusText}`)
    }

    const parsed = wormholeOperationsSchema.parse(await res.json())
    operations.push(...parsed.operations)

    if (parsed.operations.length < WORMHOLE_PAGE_SIZE) break
  }

  return operations
}

function mapWormholeOperations(
  operations: unknown[],
  address: string,
  addressField: "from" | "to",
) {
  const journeys: XcJourney[] = []

  for (const operation of operations) {
    const journey = wormholeOpToXcJourney(operation)
    if (journey && stringEquals(journey[addressField], address)) {
      journeys.push(journey)
    }
  }

  return journeys
}

export const useWormholeClaimable = (address: string) => {
  const h160 = safeConvertAnyToH160(address)

  return useQuery({
    queryKey: ["wormholescan", "claimable", "incoming-outgoing", h160],
    enabled: !!h160,
    staleTime: minutesToMilliseconds(5),
    refetchOnWindowFocus: true,
    retry: 2,
    queryFn: async () => {
      const [incoming, outgoing] = await Promise.all([
        fetchWormholeOperations({
          address: h160,
          targetChain: HYDRATION_WORMHOLE_CHAIN_ID,
        }),
        fetchWormholeOperations({
          address: h160,
          sourceChain: HYDRATION_WORMHOLE_CHAIN_ID,
        }),
      ])

      const incomingJourneys = mapWormholeOperations(incoming, h160, "to")
      const outgoingJourneys = mapWormholeOperations(outgoing, h160, "from")

      return [
        ...new Map(
          [...incomingJourneys, ...outgoingJourneys].map((journey) => [
            journey.correlationId,
            journey,
          ]),
        ).values(),
      ]
    },
  })
}
