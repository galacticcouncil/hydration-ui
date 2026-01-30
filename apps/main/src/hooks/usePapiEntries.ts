import { safeStringify } from "@galacticcouncil/utils"
import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseQueryResult,
} from "@tanstack/react-query"
import { useEffect, useRef } from "react"
import { distinctUntilChanged, Observable, skip, Subscription } from "rxjs"

import { Papi, useRpcProvider } from "@/providers/rpcProvider"

const QUERY_MAP = {
  "Uniques.Account": (query) => query.Uniques.Account,
  "OTC.Orders": (query) => query.OTC.Orders,
} as const satisfies Record<string, (query: Papi["query"]) => unknown>

type QueryKey = keyof typeof QUERY_MAP
type QueryFn<K extends QueryKey> = (typeof QUERY_MAP)[K]
type Query<K extends QueryKey> = ReturnType<QueryFn<K>>

type QueryArgs<K extends QueryKey> =
  Query<K> extends {
    watchEntries: (...args: infer A) => unknown
  }
    ? A
    : never

type QueryReturn<K extends QueryKey> = Awaited<
  ReturnType<Query<K>["getEntries"]>
>

type WatchEntriesData = {
  deltas: unknown
  entries: Array<{ args: unknown; value: unknown }>
}

export type PapiEntriesQueryOptions<
  K extends QueryKey,
  TData = QueryReturn<K>,
  TSelect = TData,
> = Omit<UseQueryOptions<TData, Error, TSelect, [K]>, "queryKey" | "queryFn">

export function usePapiEntries<
  K extends QueryKey,
  TData = QueryReturn<K>,
  TSelect = TData,
>(
  queryKey: K,
  args: QueryArgs<K>,
  options?: PapiEntriesQueryOptions<K, TData, TSelect>,
): UseQueryResult<TSelect, Error>
export function usePapiEntries<
  K extends QueryKey,
  TData = QueryReturn<K>,
  TMap = TData,
  TSelect = TMap,
>(
  queryKey: K,
  args: QueryArgs<K>,
  mapper: (entries: TData) => TMap,
  options?: PapiEntriesQueryOptions<K, TMap, TSelect>,
): UseQueryResult<TSelect, Error>
export function usePapiEntries<
  K extends QueryKey,
  TData = QueryReturn<K>,
  TMap = TData,
  TSelect = TMap,
>(
  queryKey: K,
  args: QueryArgs<K>,
  mapperOrOptions?:
    | ((entries: TData) => TMap)
    | PapiEntriesQueryOptions<K, TData, TSelect>,
  options?: PapiEntriesQueryOptions<K, TMap, TSelect>,
): UseQueryResult<TSelect, Error> {
  const queryClient = useQueryClient()
  const { papi, isApiLoaded } = useRpcProvider()
  const isWatcherInitializedRef = useRef(false)

  const mapper =
    typeof mapperOrOptions === "function" ? mapperOrOptions : undefined
  const resolvedOptions =
    typeof mapperOrOptions === "function" ? options : mapperOrOptions

  const argsKey = safeStringify(args)
  const key = `${queryKey}:${argsKey}`

  const query = useQuery({
    queryKey: [key],
    enabled: isApiLoaded,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: async () => {
      const query = QUERY_MAP[queryKey](papi.query)
      // @ts-expect-error Args vary by query type
      const entries = await query.getEntries(...args, { at: "best" })

      return mapper ? mapper(entries as TData) : entries
    },
    ...(resolvedOptions as object),
  }) as UseQueryResult<TSelect, Error>

  const mapperRef = useRef(mapper)
  useEffect(() => {
    mapperRef.current = mapper
  }, [mapper])

  const { isSuccess } = query

  useEffect(() => {
    if (isWatcherInitializedRef.current || !isSuccess) {
      return
    }

    subscribe(key, () =>
      (
        QUERY_MAP[queryKey](papi.query)
          // @ts-expect-error Args vary by query type
          .watchEntries(...args, { at: "best" })
          .pipe(
            // @ts-expect-error skips finalized block
            skip(1),
            distinctUntilChanged(
              (_, current: WatchEntriesData) => !current.deltas,
            ),
          ) as Observable<WatchEntriesData>
      ).subscribe((data) => {
        const unified = data.entries.map(({ args, value }) => ({
          keyArgs: args,
          value,
        }))

        const result = mapperRef.current
          ? mapperRef.current(unified as TData)
          : unified

        queryClient.setQueryData([key], result)
      }),
    )

    isWatcherInitializedRef.current = true

    return () => {
      unsubscribe(key)
    }
    // key contains stringified args
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [papi.query, key, queryClient, isSuccess])

  return query
}

const subscriptions = new Map<
  string,
  { readonly count: number; readonly subscription: Subscription }
>()

const subscribe = (
  key: string,
  initializeSubscription: () => Subscription,
): void => {
  const subscription = subscriptions.get(key)

  if (subscription) {
    subscriptions.set(key, {
      count: subscription.count + 1,
      subscription: subscription.subscription,
    })
  } else {
    subscriptions.set(key, {
      count: 1,
      subscription: initializeSubscription(),
    })
  }
}

const unsubscribe = (key: string): void => {
  const subscription = subscriptions.get(key)

  if (!subscription) {
    return
  }

  if (subscription.count <= 1) {
    subscription.subscription.unsubscribe()
    subscriptions.delete(key)
  } else {
    subscriptions.set(key, {
      count: subscription.count - 1,
      subscription: subscription.subscription,
    })
  }
}
