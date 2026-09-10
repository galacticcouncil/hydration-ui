import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import {
  NECKWORK_ACCOUNT_KEY,
  NECKWORK_BASE_STALE_TIME,
  NeckworkClient,
  NeckworkResponse,
  WithEpoch,
  withEpoch,
} from "."

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

type DcaScheduleItem = NeckworkResponse<"/v1/dca/schedules">["items"][number]

export type DcaSchedule = Omit<DcaScheduleItem, "createdAt" | "lastEventAt"> & {
  /** ms epoch */
  readonly createdAt: number
  /** ms epoch */
  readonly lastEventAt: number | null
}

export type DcaExecution = WithEpoch<
  NeckworkResponse<"/v1/dca/schedules/{id}/executions">["items"][number]
>

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
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "dcaSchedules",
      owner,
      statuses,
      assetIds,
      page,
      pageSize,
    ],
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!owner,
    queryFn: async (): Promise<{
      items: readonly DcaSchedule[]
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
        items: data.items.map((item) => ({
          ...item,
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
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "dcaSchedulesCount",
      owner,
      statuses,
      assetIds,
    ],
    staleTime: NECKWORK_BASE_STALE_TIME,
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

const DCA_EXECUTIONS_PAGE_SIZE = 50

export const dcaExecutionsInfiniteQuery = (
  client: NeckworkClient,
  { scheduleId }: { scheduleId: number },
) =>
  infiniteQueryOptions({
    queryKey: [...NECKWORK_ACCOUNT_KEY, "dcaExecutions", scheduleId],
    staleTime: NECKWORK_BASE_STALE_TIME,
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }): Promise<{
      items: readonly DcaExecution[]
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
        items: data.items.map(withEpoch),
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
