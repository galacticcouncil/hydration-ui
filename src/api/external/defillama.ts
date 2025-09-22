import {
  FetchQueryOptions,
  useQueries,
  useQuery,
  UseQueryOptions,
  WithRequired,
} from "@tanstack/react-query"
import { millisecondsInHour } from "date-fns"
import {
  SUSDE_ASSET_ID,
  SUSDS_ASSET_ID,
  VDOT_ASSET_ID,
  WSTETH_ASSET_ID,
} from "utils/constants"
import { QUERY_KEYS } from "utils/queryKeys"

type DefillamaApyHistoryEntry = {
  timestamp: string
  tvlUsd: number | null
  apy: number | null
  apyBase: number | null
  apyReward: number | null
  il7d: number | null
  apyBase7d: number | null
}

export const ASSET_ID_TO_DEFILLAMA_ID: Record<string, string> = {
  [VDOT_ASSET_ID]: "ff05ab26-971e-4e68-b1c6-c61a4c12c364",
  [WSTETH_ASSET_ID]: "816836c2-671f-4399-b3da-d1a4610a2ebf",
  [SUSDE_ASSET_ID]: "66985a81-9c51-46ca-9977-42b4fe7bc6df",
  [SUSDS_ASSET_ID]: "d8c4eff5-c8a9-46fc-a888-057c4c668e72",
}

const DEFILLAMA_APY_ENDPOINT =
  "https://galacticcouncil.squids.live/hydration-pools:whale-prod/api/proxy/defillama/yields/chart"

const fetchDefillamaLatestApy = async (id: string): Promise<number> => {
  const res = await fetch(`${DEFILLAMA_APY_ENDPOINT}/${id}`)
  const json = await res.json()
  const data = (json?.data ?? []) as DefillamaApyHistoryEntry[]
  const latest = data[data.length - 1]?.apy || 0
  return latest
}

export const defillamaLatestApyQuery = (
  id: string,
): WithRequired<FetchQueryOptions<number>, "queryKey"> => ({
  queryKey: QUERY_KEYS.defillamaApyHistory(id),
  queryFn: () => fetchDefillamaLatestApy(id),
  staleTime: millisecondsInHour,
})

export const useDefillamaLatestApy = (
  assetId: string,
  options: UseQueryOptions<number> = {},
) => {
  const id = ASSET_ID_TO_DEFILLAMA_ID[assetId]
  return useQuery({
    ...defillamaLatestApyQuery(id),
    ...options,
    enabled: options.enabled ?? !!id,
  })
}

export const useDefillamaLatestApyQueries = (assetIds: string[]) => {
  return useQueries({
    queries: assetIds.map((assetId) => {
      const id = ASSET_ID_TO_DEFILLAMA_ID[assetId]
      return {
        ...defillamaLatestApyQuery(id),
        enabled: !!id,
      }
    }),
  })
}
