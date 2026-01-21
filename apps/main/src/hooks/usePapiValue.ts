import { safeStringify } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { map, Observable, ObservedValueOf, shareReplay } from "rxjs"

import {
  useObservableQuery,
  UseObservableQueryOptions,
} from "@/hooks/useObservableQuery"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"

const PAPI_OBSERVER_MAP = {
  "Timestamp.Now": (query) => query.Timestamp.Now,
  "System.Account": (query) => query.System.Account,
  "System.Number": (query) => query.System.Number,
  "MultiTransactionPayment.AccountCurrencyMap": (query) =>
    query.MultiTransactionPayment.AccountCurrencyMap,
} as const satisfies Record<string, (query: Papi["query"]) => unknown>

type PapiObservableKey = keyof typeof PAPI_OBSERVER_MAP
type PapiObservableFn<K extends PapiObservableKey> =
  (typeof PAPI_OBSERVER_MAP)[K]
type PapiObservable<K extends PapiObservableKey> = ReturnType<
  PapiObservableFn<K>
>

type PapiObservableArgs<K extends PapiObservableKey> = Parameters<
  PapiObservable<K>["watchValue"]
>

type PapiObservableReturn<K extends PapiObservableKey> = ObservedValueOf<
  ReturnType<PapiObservable<K>["watchValue"]>
>

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
  const { isApiLoaded, papi } = useRpcProvider()
  const queryKey = [key, safeStringify(args)]

  // Leverage react-query cache to keep track of observables from multiple sources
  const { data: observable } = useQuery({
    queryKey: ["observable", ...queryKey],
    enabled: isApiLoaded,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => {
      const observable = PAPI_OBSERVER_MAP[key](papi.query)

      // @ts-expect-error Args are union here
      const watcher = observable.watchValue(...args) as Observable<
        PapiObservableReturn<K>
      >

      return watcher.pipe(
        // Share a single subscription and replay the last value to new consumers
        shareReplay({ bufferSize: 1, refCount: true }),
        // react-query doesn't like undefined values, so we map them to null
        map((value) => (value === undefined ? null : value)),
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
  })
}
