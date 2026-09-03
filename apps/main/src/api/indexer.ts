import { getIndexerSdk, IndexerSdk } from "@galacticcouncil/indexer/indexer"
import { useMemo } from "react"

import { ENV } from "@/config/env"

export const useIndexerClient = (): IndexerSdk => {
  return useMemo(() => getIndexerSdk(ENV.VITE_INDEXER_URL), [])
}
