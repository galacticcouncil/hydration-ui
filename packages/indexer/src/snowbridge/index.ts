import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/snowbridge/__generated__/sdk"

export * from "./transfer"
export * from "@/snowbridge/__generated__/operations"
export * from "@/snowbridge/__generated__/types"

export const getSnowbridgeSdk = (url: string) => getSdk(new GraphQLClient(url))

export type SnowbridgeSdk = ReturnType<typeof getSdk>
