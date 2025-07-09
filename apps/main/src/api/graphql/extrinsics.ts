import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import {
  ExtrinsicByBlockAndIndexDocument,
  ExtrinsicByHashDocument,
} from "@/codegen/__generated__/indexer/graphql"

export const extrinsicByHashQuery = (
  indexerClient: GraphqlClient,
  hash: string,
) =>
  queryOptions({
    queryKey: ["extrinsic", hash],
    queryFn: () => indexerClient.gql(ExtrinsicByHashDocument).send({ hash }),
    enabled: !!hash,
  })

export const extrinsicByBlockAndIndexQuery = (
  indexerClient: GraphqlClient,
  blockNumber: number,
  index: number,
) =>
  queryOptions({
    queryKey: ["extrinsic", blockNumber, index],
    queryFn: () =>
      indexerClient
        .gql(ExtrinsicByBlockAndIndexDocument)
        .send({ blockNumber: blockNumber, index: index }),
  })
