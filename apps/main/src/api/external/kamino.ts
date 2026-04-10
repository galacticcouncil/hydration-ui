import { PRIME_APY } from "@galacticcouncil/money-market/ui-config"
import { createQueryString, PRIME_ASSET_ID } from "@galacticcouncil/utils"
import {
  FetchQueryOptions,
  useQuery,
  WithRequired,
} from "@tanstack/react-query"
import BN from "bignumber.js"
import { subHours } from "date-fns"
import { last } from "remeda"
import { z } from "zod"

import { useProxyUrl } from "@/api/provider"
import { GC_TIME, STALE_TIME } from "@/utils/consts"

const KAMINO_YIELDS_HISTORY = "kamino/yields"

const getKaminoEndpoint = (yieldSource: string, indexerUrl: string) =>
  `${indexerUrl}/${KAMINO_YIELDS_HISTORY}/${yieldSource}/history`

export const ASSET_ID_TO_KAMINO_ID: Record<string, string> = {
  [PRIME_ASSET_ID]: "3b8X44fLF9ooXaUm3hhSgjpmVs6rZZ3pPoGnGahc3Uu7",
}

const historyEntrySchema = z.object({
  createdOn: z.string(),
  apr: z.string(),
  apy: z.string(),
})

const historyApiResponseSchema = z.array(historyEntrySchema)

export const fetchKaminoApy = async (address: string, indexerUrl: string) => {
  const now = new Date()
  const start = subHours(now, 2)

  console.log(
    `${getKaminoEndpoint(address, indexerUrl)}${createQueryString({
      start: start.toISOString(),
      end: now.toISOString(),
    })}`,
  )
  const response = await fetch(
    `${getKaminoEndpoint(address, indexerUrl)}${createQueryString({
      start: start.toISOString(),
      end: now.toISOString(),
    })}`,
  )
  const data = await response.json()
  const parsed = historyApiResponseSchema.parse(data)
  const lastEntry = last(parsed)

  return BN(lastEntry?.apy ?? PRIME_APY.toString())
    .times(100)
    .toNumber()
}

export const kaminoApyQuery = (
  id: string,
  indexerUrl: string,
): WithRequired<FetchQueryOptions<number>, "queryKey"> => ({
  queryKey: ["kaminoApyHistory", id],
  queryFn: () => fetchKaminoApy(id, indexerUrl),
  staleTime: STALE_TIME,
  gcTime: GC_TIME,
  retry: 0,
})

export const usePRIMEAPY = ({ enabled = true }: { enabled?: boolean }) => {
  const id = ASSET_ID_TO_KAMINO_ID[PRIME_ASSET_ID]
  const url = useProxyUrl()

  return useQuery({
    ...kaminoApyQuery(id ?? "", url),
    refetchOnWindowFocus: false,
    enabled: enabled && !!id,
  })
}
