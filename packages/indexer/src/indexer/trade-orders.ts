import { queryOptions } from "@tanstack/react-query"

import { IndexerSdk } from "@/indexer"

export const scheduledOrdersQuery = (indexerSdk: IndexerSdk, who: string) =>
  queryOptions({
    queryKey: ["trade", "orders", "ScheduledOrders", who],
    queryFn: () => indexerSdk.ScheduledOrders({ who }),
    enabled: !!who,
  })

export const ordersStatusQuery = (indexerSdk: IndexerSdk, who: string) =>
  queryOptions({
    queryKey: ["trade", "orders", "OrdersStatus", who],
    queryFn: () => indexerSdk.OrdersStatus({ who }),
    enabled: !!who,
  })

export const orderTradesQuery = (indexerSdk: IndexerSdk, id: number) =>
  queryOptions({
    queryKey: ["trade", "orders", "OrderTrades", id],
    queryFn: () => indexerSdk.OrderTrades({ id }),
    enabled: !!id,
  })

export const orderPlannedExecutionQuery = (
  indexerSdk: IndexerSdk,
  id: number,
) =>
  queryOptions({
    queryKey: ["trade", "orders", "OrderPlannedExecution", id],
    queryFn: () => indexerSdk.OrderPlannedExecution({ id }),
    enabled: !!id,
  })
