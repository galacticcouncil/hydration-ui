import { safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { map, ObservedValueOf, shareReplay } from "rxjs"

import {
  useObservableQuery,
  UseObservableQueryOptions,
} from "@/hooks/useObservableQuery"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"

const PAPI_OBSERVER_MAP = {
  "Timestamp.Now": (query) => query.Timestamp.Now,
  "System.Account": (query) => query.System.Account,
  "System.Number": (query) => query.System.Number,
  "Uniques.Account": (query) => query.Uniques.Account,
  "MultiTransactionPayment.AccountCurrencyMap": (query) =>
    query.MultiTransactionPayment.AccountCurrencyMap,
  "OTC.Orders": (query) => query.OTC.Orders,
} as const satisfies Record<string, (query: Papi["query"]) => unknown>

type PapiObservableKey = keyof typeof PAPI_OBSERVER_MAP
type PapiObservableFn<K extends PapiObservableKey> =
  (typeof PAPI_OBSERVER_MAP)[K]
type PapiObservable<K extends PapiObservableKey> = ReturnType<
  PapiObservableFn<K>
>

type PapiObservableWatchType = "value" | "entries"

type PapiObservableArgsValue<K extends PapiObservableKey> = Parameters<
  PapiObservable<K>["watchValue"]
>

type PapiObservableArgsEntries<K extends PapiObservableKey> =
  PapiObservable<K> extends { watchEntries: (...args: infer A) => unknown }
    ? A
    : never

type PapiObservableArgs<
  K extends PapiObservableKey,
  W extends PapiObservableWatchType = "value",
> = W extends "value"
  ? PapiObservableArgsValue<K>
  : W extends "entries"
    ? PapiObservableArgsEntries<K>
    : never

type PapiObservableReturnValue<K extends PapiObservableKey> = ObservedValueOf<
  ReturnType<PapiObservable<K>["watchValue"]>
>

type PapiObservableReturnEntries<K extends PapiObservableKey> =
  PapiObservable<K> extends { watchEntries: (...args: never[]) => unknown }
    ? ObservedValueOf<ReturnType<PapiObservable<K>["watchEntries"]>>
    : never

export type UsePapiObservableQueryOptions<
  T,
  TData = T,
  W extends PapiObservableWatchType = "value",
> = Omit<UseObservableQueryOptions<T, TData>, "queryKey" | "observable"> & {
  watchType?: W
}

export function usePapiObservableQuery<
  K extends PapiObservableKey,
  TData = PapiObservableReturnValue<K>,
>(
  key: K,
  args: PapiObservableArgs<K, "value">,
  options?: UsePapiObservableQueryOptions<
    PapiObservableReturnValue<K>,
    TData,
    "value"
  >,
): ReturnType<typeof useObservableQuery<PapiObservableReturnValue<K>, TData>>
export function usePapiObservableQuery<
  K extends PapiObservableKey,
  TData = PapiObservableReturnEntries<K>,
>(
  key: K,
  args: PapiObservableArgs<K, "entries">,
  options: UsePapiObservableQueryOptions<
    PapiObservableReturnEntries<K>,
    TData,
    "entries"
  > & {
    watchType: "entries"
  },
): ReturnType<typeof useObservableQuery<PapiObservableReturnEntries<K>, TData>>
export function usePapiObservableQuery<
  K extends PapiObservableKey,
  W extends PapiObservableWatchType = "value",
>(
  key: K,
  args: PapiObservableArgs<K, "value"> | PapiObservableArgs<K, "entries">,
  options?: UsePapiObservableQueryOptions<
    PapiObservableReturnValue<K> | PapiObservableReturnEntries<K>,
    unknown,
    W
  >,
) {
  const { isApiLoaded, papi } = useRpcProvider()
  const watchType = options?.watchType ?? "value"
  const queryKey = [key, watchType, safeStringify(args)]

  // Leverage react-query cache to keep track of observables from multiple sources
  const { data: observable } = useQuery({
    queryKey: ["observable", ...queryKey],
    enabled: isApiLoaded,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => {
      const observable = PAPI_OBSERVER_MAP[key](papi.query)

      const watcher =
        watchType === "entries"
          ? // @ts-expect-error Args are union here
            observable.watchEntries(...args)
          : // @ts-expect-error Args are union here
            observable.watchValue(...args)

      return watcher.pipe(
        // Share a single subscription and replay the last value to new consumers
        shareReplay({ bufferSize: 1, refCount: true }),
        // react-query doesn't like undefined values, so we map them to null
        map((value) => (value === undefined ? null : value)),
      )
    },
  })

  return useObservableQuery({
    queryKey,
    observable,
    ...options,
  })
}
