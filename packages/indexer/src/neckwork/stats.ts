import { queryOptions } from "@tanstack/react-query"

import { NECKWORK_STALE_TIME, NeckworkClient } from "."

export const platformStatsQuery = (client: NeckworkClient) =>
  queryOptions({
    queryKey: ["neckwork", "platformStats"],
    staleTime: NECKWORK_STALE_TIME,
    queryFn: async () => {
      const { data } = await client.GET("/v1/stats/platform")

      if (!data) throw new Error("Neckwork API returned no platform stats")

      const { tvl, volume24h } = data

      return {
        omnipoolTvlNorm: tvl.omnipoolUsd,
        stablepoolsTvlNorm: tvl.stableswapUsd,
        xykTvlNorm: tvl.xykUsd,
        totalTvlNorm: tvl.totalUsd,
        omnipoolVolNorm: volume24h.omnipoolUsd,
        stableswapVolNorm: volume24h.stableswapUsd,
        xykVolNorm: volume24h.xykUsd,
      }
    },
  })
