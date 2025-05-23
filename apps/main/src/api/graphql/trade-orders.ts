import { queryOptions } from "@tanstack/react-query"
import { TypedDocument } from "graffle"

import { GraphqlClient } from "@/api/provider"
import { TradeOrdersDocument } from "@/codegen/__generated__/squid/graphql"

export enum DcaScheduleStatus {
  Created = "Created",
  Completed = "Completed",
  Terminated = "Terminated",
}

export enum DcaScheduleExecutionStatus {
  Planned = "Planned",
  Executed = "Executed",
  Failed = "Failed",
}

export const tradeOrdersQuery = (
  squidClient: GraphqlClient,
  address: string,
  page: number,
  pageSize: number,
) =>
  queryOptions({
    queryKey: ["trade", "orders", address, page, pageSize],
    queryFn: () =>
      squidClient
        .gql(TradeOrdersDocument)
        .send({ address, offset: (page - 1) * pageSize, pageSize }),
  })
