import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "."

export const latestBlockHeightQuery = (squidSdk: SquidSdk, url: string) =>
  queryOptions({
    queryKey: ["latestBlockHeight", url],
    queryFn: async () => {
      try {
        const result = await squidSdk.LatestBlockHeightQuery()
        return result.blocks?.edges?.[0]?.node?.height ?? null
      } catch {
        return null
      }
    },
    refetchInterval: 10_000,
    retry: false,
  })
