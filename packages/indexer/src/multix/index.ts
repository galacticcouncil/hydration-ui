import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/multix/__generated__/sdk"

export * from "./accounts"
export * from "@/multix/__generated__/operations"
export * from "@/multix/__generated__/types"

export const getMultixSdk = (url: string) => getSdk(new GraphQLClient(url))

export type MultixSdk = ReturnType<typeof getSdk>
