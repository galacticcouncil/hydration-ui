import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const newFarmsQuery = (indexerSdk: IndexerSdk, blockNumber: number) =>
  queryOptions({
    queryKey: ["farms", "new"],
    queryFn: () => indexerSdk.YieldFarmCreated({ blockNumber }),
    enabled: !!blockNumber,
  })
