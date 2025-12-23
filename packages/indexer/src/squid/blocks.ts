import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "."

export const latestBlockHeightQuery = (
  squidSdk: SquidSdk,
  url: string,
  refetchInterval?: number,
) =>
  queryOptions({
    queryKey: ["latestBlockHeight", url],
    queryFn: async () => {
      const result = await squidSdk.LatestBlockHeightQuery()

      return result.blocks?.edges?.[0]?.node?.height ?? null
    },
    refetchInterval,
  })
