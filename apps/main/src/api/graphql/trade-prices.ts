import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import { TradePricesDocument } from "@/codegen/__generated__/squid/graphql"

export const tradePricesQuery = (
  squidClient: GraphqlClient,
  assetInId: string,
  assetOutId: string,
  startingBlock: number,
) =>
  queryOptions({
    queryKey: ["trade", "prices", startingBlock],
    queryFn: () =>
      squidClient.gql(TradePricesDocument).send({
        assetInId,
        assetOutId,
        filter: {
          paraBlockHeight: {
            greaterThanOrEqualTo: startingBlock,
          },
        },
      }),
  })
