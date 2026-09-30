import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query"

import {
  NECKWORK_ACCOUNT_KEY,
  NECKWORK_BASE_STALE_TIME,
  NeckworkClient,
  NeckworkResponse,
  WithEpoch,
  withEpoch,
} from "."

export const INTENT_STATUSES = [
  "open",
  "partially_filled",
  "filled",
  "cancelled",
  "expired",
  "completed",
] as const

export type IntentStatus = (typeof INTENT_STATUSES)[number]

/** `partially_filled` is a LIVE state — the remainder keeps resting and filling. */
export const INTENT_OPEN_STATUSES = ["open", "partially_filled"] as const

export const INTENT_HISTORY_STATUSES = [
  "filled",
  "cancelled",
  "expired",
  "completed",
] as const

export const INTENT_KINDS = ["swap", "dca"] as const

export type IntentKind = (typeof INTENT_KINDS)[number]

type IntentItem = NeckworkResponse<"/v1/intents">["items"][number]

export type Intent = Omit<IntentItem, "createdAt" | "lastEventAt"> & {
  /** ms epoch */
  readonly createdAt: number
  /** ms epoch */
  readonly lastEventAt: number | null
}

export type IntentEvent = WithEpoch<
  NeckworkResponse<"/v1/intents/{id}/events">["items"][number]
>

const toIntent = (item: IntentItem): Intent => ({
  ...item,
  createdAt: new Date(item.createdAt).getTime(),
  lastEventAt: item.lastEventAt ? new Date(item.lastEventAt).getTime() : null,
})

type IntentsFilter = {
  owner: string
  statuses: readonly IntentStatus[]
  kinds: readonly IntentKind[]
  assetIds: string[]
}

type IntentsArgs = IntentsFilter & {
  page: number
  pageSize: number
}

const intentsFilterParams = ({
  owner,
  statuses,
  kinds,
  assetIds,
}: IntentsFilter) => ({
  owner,
  status: statuses.join(","),
  ...(kinds.length ? { kind: kinds.join(",") } : {}),
  ...(assetIds.length ? { assets: assetIds.join(",") } : {}),
})

export const intentsQuery = (
  client: NeckworkClient,
  { owner, statuses, kinds, assetIds, page, pageSize }: IntentsArgs,
) =>
  queryOptions({
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "intents",
      owner,
      statuses,
      kinds,
      assetIds,
      page,
      pageSize,
    ],
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!owner,
    queryFn: async (): Promise<{
      items: readonly Intent[]
      totalCount: number
    }> => {
      const { data } = await client.GET("/v1/intents", {
        params: {
          query: {
            ...intentsFilterParams({ owner, statuses, kinds, assetIds }),
            limit: pageSize,
            offset: page * pageSize,
          },
        },
      })

      if (!data) throw new Error("Neckwork API returned no intents")

      return {
        items: data.items.map(toIntent),
        totalCount: data.totalCount,
      }
    },
  })

export const intentsCountQuery = (
  client: NeckworkClient,
  { owner, statuses, kinds, assetIds }: IntentsFilter,
) =>
  queryOptions({
    queryKey: [
      ...NECKWORK_ACCOUNT_KEY,
      "intentsCount",
      owner,
      statuses,
      kinds,
      assetIds,
    ],
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!owner,
    queryFn: async (): Promise<number> => {
      const { data } = await client.GET("/v1/intents/count", {
        params: {
          query: intentsFilterParams({ owner, statuses, kinds, assetIds }),
        },
      })

      if (!data) throw new Error("Neckwork API returned no intent count")

      return data.totalCount
    },
  })

/** `intentId` is a u128 decimal string — never a number, never a bigint in a key. */
export const intentQuery = (
  client: NeckworkClient,
  { intentId }: { intentId: string },
) =>
  queryOptions({
    queryKey: [...NECKWORK_ACCOUNT_KEY, "intent", intentId],
    staleTime: NECKWORK_BASE_STALE_TIME,
    enabled: !!intentId,
    queryFn: async (): Promise<Intent> => {
      const { data } = await client.GET("/v1/intents/{id}", {
        params: { path: { id: intentId } },
      })

      if (!data) throw new Error("Neckwork API returned no intent")

      return toIntent(data)
    },
  })

const INTENT_EVENTS_PAGE_SIZE = 50

export const intentEventsInfiniteQuery = (
  client: NeckworkClient,
  { intentId }: { intentId: string },
) =>
  infiniteQueryOptions({
    queryKey: [...NECKWORK_ACCOUNT_KEY, "intentEvents", intentId],
    staleTime: NECKWORK_BASE_STALE_TIME,
    initialPageParam: 0,
    queryFn: async ({
      pageParam,
    }): Promise<{
      items: readonly IntentEvent[]
      totalCount: number
      assetIn: string
      assetOut: string
    }> => {
      const { data } = await client.GET("/v1/intents/{id}/events", {
        params: {
          path: { id: intentId },
          query: { limit: INTENT_EVENTS_PAGE_SIZE, offset: pageParam },
        },
      })

      if (!data) throw new Error("Neckwork API returned no intent events")

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
