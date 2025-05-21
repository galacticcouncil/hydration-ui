import { queryOptions } from "@tanstack/react-query"

import { GraphqlClient } from "@/api/provider"
import {
  UserOpenOrdersCountDocument,
  UserOrdersDocument,
  UserSwapsDocument,
} from "@/codegen/__generated__/squid/graphql"
import { QUERY_KEY_BLOCK_PREFIX } from "@/utils/consts"

export enum DcaScheduleStatus {
  Created = "Created",
  Completed = "Completed",
  Terminated = "Terminated",
}

export const isDcaScheduleStatus = (
  status: unknown,
): status is DcaScheduleStatus =>
  Object.values(DcaScheduleStatus).includes(status as DcaScheduleStatus)

export enum DcaScheduleExecutionStatus {
  Planned = "Planned",
  Executed = "Executed",
  Failed = "Failed",
}

export const isDcaScheduleExecutionStatus = (
  status: unknown,
): status is DcaScheduleExecutionStatus =>
  Object.values(DcaScheduleExecutionStatus).includes(
    status as DcaScheduleExecutionStatus,
  )

export enum TradeOperation {
  ExactIn = "ExactIn",
  ExactOut = "ExactOut",
  Limit = "Limit",
  LiquidityAdd = "LiquidityAdd",
  LiquidityRemove = "LiquidityRemove",
}

export const isTradeOperation = (status: unknown): status is TradeOperation =>
  Object.values(TradeOperation).includes(status as TradeOperation)

type AllSwaps = true

export type SwapsQueryAddress = string | AllSwaps

export const userSwapsQuery = (
  squidClient: GraphqlClient,
  address: SwapsQueryAddress,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "orders",
      address,
      assetIds,
      page,
      pageSize,
    ],
    queryFn: () =>
      squidClient.gql(UserSwapsDocument).send({
        ...(address && typeof address === "string"
          ? {
              swapperIdFilter: {
                equalTo: address,
              },
            }
          : {}),
        ...(assetIds.length
          ? {
              allInvolvedAssetRegistryIds: { contains: assetIds },
            }
          : {}),
        offset: (page - 1) * pageSize,
        pageSize,
      }),
    enabled: !!address,
  })

export const userOrdersQuery = (
  squidClient: GraphqlClient,
  address: string,
  status: Array<DcaScheduleStatus>,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "openOrders",
      "list",
      address,
      status,
      assetIds,
      page,
      pageSize,
    ],
    queryFn: () =>
      squidClient.gql(UserOrdersDocument).send({
        address,
        ...(assetIds.length
          ? {
              assetInId: { in: assetIds },
              assetOutId: { in: assetIds },
            }
          : {}),
        status,
        offset: (page - 1) * pageSize,
        pageSize,
      }),
    enabled: !!address,
  })

export const userOpenOrdersCountQuery = (
  squidClient: GraphqlClient,
  address: string,
  assetIds: Array<string>,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "openOrders",
      "count",
      address,
      assetIds,
    ],
    queryFn: () =>
      squidClient.gql(UserOpenOrdersCountDocument).send({
        address,
        ...(assetIds.length
          ? {
              assetFilter: {
                assetInId: { in: assetIds },
                assetOutId: { in: assetIds },
              },
            }
          : {}),
      }),
    enabled: !!address,
  })
