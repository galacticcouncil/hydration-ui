import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/squid/__generated__/sdk"

export * from "./account-balances"
export * from "./money-market"
export * from "./trade-orders"
export * from "./trade-prices"
export * from "@/squid/__generated__/operations"
export * from "@/squid/__generated__/types"

export const getSquidSdk = (url: string) => getSdk(new GraphQLClient(url))

export type SquidSdk = ReturnType<typeof getSdk>
