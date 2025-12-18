import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"

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
  squidSdk: SquidSdk,
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
      squidSdk.UserSwaps({
        ...(address &&
          typeof address === "string" && {
            swapperIdFilter: {
              equalTo: address,
            },
          }),
        ...(assetIds.length && {
          orFilter: assetIds.map((assetId) => ({
            allInvolvedAssetRegistryIds: { contains: [assetId] },
          })),
        }),
        offset: (page - 1) * pageSize,
        pageSize,
      }),
    enabled: !!address,
  })

export const userOrdersQuery = (
  squidSdk: SquidSdk,
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
      squidSdk.UserOrders({
        address,
        ...(assetIds.length && {
          assetInId: { in: assetIds },
          assetOutId: { in: assetIds },
        }),
        status,
        offset: (page - 1) * pageSize,
        pageSize,
      }),
    enabled: !!address,
  })

export const userOpenOrdersCountQuery = (
  squidSdk: SquidSdk,
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
      squidSdk.UserOpenOrdersCount({
        address,
        ...(assetIds.length && {
          assetFilter: {
            assetInId: { in: assetIds },
            assetOutId: { in: assetIds },
          },
        }),
      }),
    enabled: !!address,
  })

export const dcaScheduleExecutionsQuery = (
  squidSdk: SquidSdk,
  scheduleId: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "dcaSchedule",
      "swaps",
      scheduleId,
    ],
    queryFn: () =>
      squidSdk.DcaScheduleExecutions({
        scheduleId: scheduleId.toString(),
      }),
    enabled: !!scheduleId,
  })

export const useRoutedTradesQuery = (
  squidSdk: SquidSdk,
  address: string,
  assetIds: Array<string>,
  page: number,
  pageSize: number,
) =>
  queryOptions({
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "trade",
      "routedTrades",
      address,
      assetIds,
      page,
      pageSize,
    ],
    queryFn: () =>
      squidSdk.RoutedTrades({
        address,
        ...(assetIds.length && {
          inputAssetRegistryIds: { containedBy: assetIds },
          outputAssetRegistryIds: { containedBy: assetIds },
        }),
        offset: (page - 1) * pageSize,
        pageSize,
      }),
    enabled: !!address,
  })
