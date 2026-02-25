import {
  FetchQueryOptions,
  useQuery,
  WithRequired,
} from "@tanstack/react-query"
import { PRIME_APY } from "api/borrow"
import { millisecondsInHour, subHours } from "date-fns"
import { PRIME_ASSET_ID } from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"
import { z } from "zod"
import BN from "bignumber.js"

//TODO: probably change indexer to orca
const getKaminoEndpoint = (yieldSource: string) =>
  `https://galacticcouncil.squids.live/hydration-pools:orca-prod-pool-01/api/proxy/kamino/yields/${yieldSource}/history`

export const ASSET_ID_TO_KAMINO_ID: Record<string, string> = {
  [PRIME_ASSET_ID]: "3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7",
}

const historyEntrySchema = z.object({
  createdOn: z.string(),
  apr: z.string(),
  apy: z.string(),
})

const historyApiResponseSchema = z.array(historyEntrySchema)

export const fetchKaminoApy = async (address: string) => {
  const now = new Date()
  const start = subHours(now, 2)
  const response = await fetch(
    `${getKaminoEndpoint(address)}?start=${start.toISOString()}&end=${now.toISOString()}`,
  )
  const data = await response.json()
  const parsed = historyApiResponseSchema.parse(data)
  const lastEntry = parsed[parsed.length - 1]

  return BN(lastEntry.apy ?? PRIME_APY.toString())
    .times(100)
    .toNumber()
}

export const kaminoApyQuery = (
  id: string,
): WithRequired<FetchQueryOptions<number>, "queryKey"> => ({
  queryKey: QUERY_KEYS.kaminoApyHistory(id),
  queryFn: () => fetchKaminoApy(id),
  staleTime: millisecondsInHour,
  cacheTime: millisecondsInHour,
  retry: 0,
})

export const usePRIMEAPY = ({ enabled = true }: { enabled?: boolean }) => {
  return useQuery({
    ...kaminoApyQuery(ASSET_ID_TO_KAMINO_ID[PRIME_ASSET_ID]),
    refetchOnWindowFocus: false,
    enabled,
  })
}
