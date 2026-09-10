import { safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { map, Observable, ObservedValueOf, shareReplay } from "rxjs"

import { Papi } from "@/api/rpcClient"
import {
  useObservableQuery,
  UseObservableQueryOptions,
} from "@/hooks/useObservableQuery"
import { useRpcProvider } from "@/providers/rpcProvider"

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0

const PAPI_OBSERVER_MAP = {
  "Timestamp.Now": {
    getObservable: (query: Papi["query"]) => query.Timestamp.Now,
  },
  "System.Account": {
    getObservable: (query: Papi["query"]) => query.System.Account,
    isArgsReady: (args: readonly unknown[]) => isNonEmptyString(args[0]),
  },
  "System.Number": {
    getObservable: (query: Papi["query"]) => query.System.Number,
  },
  "MultiTransactionPayment.AccountCurrencyMap": {
    getObservable: (query: Papi["query"]) =>
      query.MultiTransactionPayment.AccountCurrencyMap,
    isArgsReady: (args: readonly unknown[]) => isNonEmptyString(args[0]),
  },
} as const

type PapiObservableKey = keyof typeof PAPI_OBSERVER_MAP
type PapiObservable<K extends PapiObservableKey> = ReturnType<
  (typeof PAPI_OBSERVER_MAP)[K]["getObservable"]
>

type PapiObservableArgs<K extends PapiObservableKey> = Parameters<
  PapiObservable<K>["watchValue"]
>

type PapiObservableReturn<K extends PapiObservableKey> = ObservedValueOf<
  ReturnType<PapiObservable<K>["watchValue"]>
>["value"]

export type UsePapiObservableQueryOptions<T, TData = T> = Omit<
  UseObservableQueryOptions<T, TData>,
  "queryKey" | "observable"
>

export function usePapiValue<
  K extends PapiObservableKey,
  TData = PapiObservableReturn<K>,
>(
  key: K,
  args: PapiObservableArgs<K>,
  options?: UsePapiObservableQueryOptions<PapiObservableReturn<K>, TData>,
) {
  const { isReady, papi } = useRpcProvider()
  const queryKey = [key, safeStringify(args)]
  const entry = PAPI_OBSERVER_MAP[key]
  const argsReady = "isArgsReady" in entry ? entry.isArgsReady(args) : true
  const queryEnabled = isReady && argsReady && (options?.enabled ?? true)

  // Leverage react-query cache to keep track of observables from multiple sources
  const { data: observable } = useQuery({
    queryKey: ["observable", ...queryKey],
    enabled: queryEnabled,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => {
      const observable = entry.getObservable(papi.query)

      // @ts-expect-error Args are a union keyed by observable type
      const watcher = observable.watchValue(...args) as Observable<{
        value: PapiObservableReturn<K>
      }>

      return watcher.pipe(
        // Share a single subscription and replay the last value to new consumers
        shareReplay({ bufferSize: 1, refCount: true }),
        // react-query doesn't like undefined values, so we map them to null
        map(({ value }) => (value === undefined ? null : value)),
      )
    },
  })

  return useObservableQuery<PapiObservableReturn<K>, TData>({
    queryKey,
    observable: observable as UseObservableQueryOptions<
      PapiObservableReturn<K>,
      TData
    >["observable"],
    ...options,
    enabled: queryEnabled,
  })
}
