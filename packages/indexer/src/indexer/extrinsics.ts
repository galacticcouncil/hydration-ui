import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const extrinsicByHashQuery = (indexerSdk: IndexerSdk, hash: string) =>
  queryOptions({
    queryKey: ["extrinsic", hash],
    queryFn: () => indexerSdk.ExtrinsicByHash({ hash }),
    enabled: !!hash,
  })

export const extrinsicByBlockAndIndexQuery = (
  indexerSdk: IndexerSdk,
  blockNumber: number,
  index: number,
) =>
  queryOptions({
    queryKey: ["extrinsic", blockNumber, index],
    queryFn: () => indexerSdk.ExtrinsicByBlockAndIndex({ blockNumber, index }),
  })
