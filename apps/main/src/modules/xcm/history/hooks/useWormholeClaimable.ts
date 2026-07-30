import {
  safeConvertAnyToH160,
  stringEquals,
  wormholescan,
} from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { minutesToMilliseconds } from "date-fns"
import { isNonNullish } from "remeda"

import {
  wormholeOperationsSchema,
  wormholeOpToXcJourney,
} from "@/modules/xcm/history/utils/wormhole"

const HYDRATION_WORMHOLE_CHAIN_ID = 73

export const useWormholeClaimable = (address: string) => {
  const h160 = safeConvertAnyToH160(address)

  return useQuery({
    queryKey: ["wormholescan", "claimable", h160],
    enabled: !!h160,
    staleTime: minutesToMilliseconds(5),
    refetchOnWindowFocus: true,
    retry: 2,
    queryFn: async () => {
      const res = await fetch(
        wormholescan.api("operations", {
          address: h160,
          targetChain: HYDRATION_WORMHOLE_CHAIN_ID,
        }),
      )

      if (!res.ok) {
        throw new Error(
          `WormholeScan API error: ${res.status} ${res.statusText}`,
        )
      }

      const parsed = wormholeOperationsSchema.parse(await res.json())

      return parsed.operations
        .map(wormholeOpToXcJourney)
        .filter(isNonNullish)
        .filter((journey) => stringEquals(journey.to, h160))
    },
  })
}
