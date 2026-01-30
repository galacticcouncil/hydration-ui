import { meta } from "@galacticcouncil/common"
import { IndexerErrorState } from "@galacticcouncil/indexer/squid/lib/parseIndexerErrorState"
import { hydration } from "@polkadot-api/descriptors"
import { queryOptions } from "@tanstack/react-query"

import { GC_TIME, STALE_TIME } from "@/utils/consts"

export const decodePjsErrorQuery = (
  errorState: IndexerErrorState | null | undefined,
) =>
  queryOptions({
    queryKey: ["errors", errorState],
    queryFn: async () => {
      if (!errorState) {
        return null
      }

      const metadataBytes = await hydration.getMetadata()
      const decoder = meta.ErrorDecoder(metadataBytes)

      return decoder.decode(errorState.index, errorState.error) ?? null
    },
    enabled: !!errorState,
    gcTime: GC_TIME,
    staleTime: STALE_TIME,
  })
