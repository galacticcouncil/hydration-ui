import { GraphQLClient } from "graphql-request"

import { getSdk } from "@/squid/__generated__/sdk"

export * from "./account-balances"
export * from "./money-market"
export * from "./platform-total"
export * from "./pool-metrics"
export * from "./trade-orders"
export * from "./trade-prices"
export * from "./volume"
export * from "@/squid/__generated__/operations"
export * from "@/squid/__generated__/types"

export const getSquidSdk = (url: string) => getSdk(new GraphQLClient(url))

export type SquidSdk = ReturnType<typeof getSdk>
