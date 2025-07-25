import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/indexer/__generated__/sdk"

export * from "./extrinsics"
export * from "./otc"
export * from "@/indexer/__generated__/operations"

export const getIndexerSdk = (url: string) => getSdk(new GraphQLClient(url))

export type IndexerSdk = ReturnType<typeof getSdk>
