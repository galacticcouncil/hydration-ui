import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const pureCreatedEventsQuery = (
  indexerSdk: IndexerSdk,
  purePublicKey: string,
) =>
  queryOptions({
    queryKey: ["proxy", "pureCreated", purePublicKey],
    queryFn: () => indexerSdk.PureCreatedEvents({ purePublicKey }),
  })
