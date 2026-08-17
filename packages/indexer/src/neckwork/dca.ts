import { QUERY_KEY_BLOCK_PREFIX } from "@galacticcouncil/utils"
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import { NECKWORK_STALE_TIME, NeckworkClient } from "."

export const DCA_STATUSES = [
  "created",
  "completed",
  "terminated",
  "cancelled",
] as const

export type DcaStatus = (typeof DCA_STATUSES)[number]

export const DCA_OPEN_STATUSES = ["created"] as const

export const DCA_HISTORY_STATUSES = [
  "completed",
  "terminated",
  "cancelled",
] as const

export type DcaSchedule = {
  scheduleId: number
  assetIn: string
  assetOut: string
  /** raw on-chain integer */
  singleTradeAmount: string
  /** raw on-chain integer */
  budget: string
  isRollingBudget: boolean
  /** raw on-chain integer */
  executedAmountIn: string
  /** raw on-chain integer */
  executedAmountOut: string
  periodBlocks: number
  status: DcaStatus
  /** ms epoch */
  createdAt: number
  /** ms epoch */
  lastEventAt: number | null
}

export type DcaExecution = {
  status: "executed" | "failed" | "planned"
  /** raw on-chain integer, null on failed/planned attempts */
  amountIn: string | null
  /** raw on-chain integer, null on failed/planned attempts */
  amountOut: string | null
  blockHeight: number
  eventIndex: number
  /** ms epoch */
  timestamp: number
  errorState: { kind: string; error: string; index: number } | null
}

type DcaSchedulesFilter = {
  owner: string
  statuses: readonly DcaStatus[]
  assetIds: string[]
}

type DcaSchedulesArgs = DcaSchedulesFilter & {
  page: number
  pageSize: number
}

const schedulesFilterParams = ({
  owner,
  statuses,
  assetIds,
}: DcaSchedulesFilter) => ({
  owner,
  status: statuses.join(","),
  ...(assetIds.length ? { assets: assetIds.join(",") } : {}),
})

export const dcaSchedulesQuery = (
  client: NeckworkClient,
  { owner, statuses, assetIds, page, pageSize }: DcaSchedulesArgs,
) =>
  queryOptions({
    // no staleTime — the block prefix invalidates this every block
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "neckwork",
      "dcaSchedules",
      owner,
      statuses,
      assetIds,
      page,
      pageSize,
    ],
    enabled: !!owner,
    queryFn: async (): Promise<{
      items: DcaSchedule[]
      totalCount: number
    }> => {
      const { data } = await client.GET("/v1/dca/schedules", {
        params: {
          query: {
            ...schedulesFilterParams({ owner, statuses, assetIds }),
            limit: pageSize,
            offset: page * pageSize,
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no DCA schedules")

      return {
        items: Array.from(data.items).map((item) => ({
          scheduleId: item.scheduleId,
          assetIn: item.assetIn,
          assetOut: item.assetOut,
          singleTradeAmount: item.singleTradeAmount,
          budget: item.budget,
          isRollingBudget: item.isRollingBudget,
          executedAmountIn: item.executedAmountIn,
          executedAmountOut: item.executedAmountOut,
          periodBlocks: item.periodBlocks,
          status: item.status,
          createdAt: new Date(item.createdAt).getTime(),
          lastEventAt: item.lastEventAt
            ? new Date(item.lastEventAt).getTime()
            : null,
        })),
        totalCount: data.totalCount,
      }
    },
  })

export const dcaSchedulesCountQuery = (
  client: NeckworkClient,
  { owner, statuses, assetIds }: DcaSchedulesFilter,
) =>
  queryOptions({
    // no staleTime — the block prefix invalidates this every block
    queryKey: [
      QUERY_KEY_BLOCK_PREFIX,
      "neckwork",
      "dcaSchedulesCount",
      owner,
      statuses,
      assetIds,
    ],
    enabled: !!owner,
    queryFn: async (): Promise<number> => {
      const { data } = await client.GET("/v1/dca/schedules/count", {
        params: {
          query: schedulesFilterParams({ owner, statuses, assetIds }),
        },
      })

      if (!data) throw new Error("Neckwork API returned no DCA schedule count")

      return data.totalCount
    },
  })

const DCA_EXECUTIONS_PAGE_SIZE = 200

export const dcaExecutionsInfiniteQuery = (
  client: NeckworkClient,
  { scheduleId }: { scheduleId: number },
) =>
  infiniteQueryOptions({
    // off the block prefix on purpose: an infinite query in a modal would
    // refetch every loaded page each block to catch an hourly execution
    queryKey: ["neckwork", "dcaExecutions", scheduleId],
    staleTime: NECKWORK_STALE_TIME,
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }): Promise<{
      items: DcaExecution[]
      totalCount: number
      assetIn: string
      assetOut: string
    }> => {
      const { data } = await client.GET("/v1/dca/schedules/{id}/executions", {
        params: {
          path: { id: scheduleId },
          query: { limit: DCA_EXECUTIONS_PAGE_SIZE, offset: pageParam },
        },
      })

      if (!data) throw new Error("Neckwork API returned no DCA executions")

      return {
        items: Array.from(data.items).map((item) => ({
          status: item.status,
          amountIn: item.amountIn,
          amountOut: item.amountOut,
          blockHeight: item.blockHeight,
          eventIndex: item.eventIndex,
          timestamp: new Date(item.timestamp).getTime(),
          errorState: item.errorState,
        })),
        totalCount: data.totalCount,
        assetIn: data.assetIn,
        assetOut: data.assetOut,
      }
    },
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0)
      return loaded < lastPage.totalCount ? loaded : undefined
    },
  })
