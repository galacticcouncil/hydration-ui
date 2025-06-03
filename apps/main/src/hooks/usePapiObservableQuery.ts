import { safeStringify } from "@galacticcouncil/utils"
import { useMemo } from "react"
import { map, Observable, shareReplay } from "rxjs"

import {
  useObservableQuery,
  UseObservableQueryOptions,
} from "@/hooks/useObservableQuery"
import { Papi, useRpcProvider } from "@/providers/rpcProvider"

const PAPI_OBSERVER_MAP = {
  "System.Number": (papi: Papi) => papi.query.System.Number,
  "MultiTransactionPayment.AccountCurrencyMap": (papi: Papi) =>
    papi.query.MultiTransactionPayment.AccountCurrencyMap,
} as const

type PapiObservableKey = keyof typeof PAPI_OBSERVER_MAP
type PapiObservableFn<K extends PapiObservableKey> =
  (typeof PAPI_OBSERVER_MAP)[K]
type PapiObservable<K extends PapiObservableKey> = ReturnType<
  PapiObservableFn<K>
>
type PapiObservableArgs<K extends PapiObservableKey> = Parameters<
  PapiObservable<K>["watchValue"]
>

type PapiObservableReturn<K extends PapiObservableKey> = Awaited<
  ReturnType<PapiObservable<K>["getValue"]>
>
export type UsePapiObservableQueryOptions<T> = Omit<
  UseObservableQueryOptions<T>,
  "queryKey" | "observable"
>

export const usePapiObservableQuery = <
  K extends PapiObservableKey,
  T extends PapiObservableReturn<K>,
>(
  key: K,
  args: PapiObservableArgs<K>,
  options?: UsePapiObservableQueryOptions<T>,
) => {
  const { isApiLoaded, papi } = useRpcProvider()

  const observable = useMemo(() => {
    if (!isApiLoaded) return
    const observable = PAPI_OBSERVER_MAP[key](papi)

    return (
      observable
        // @ts-expect-error Args are union here, so TS complains, but they are correctly inferred in the input of the function
        .watchValue(...args)
        .pipe(
          shareReplay(1),
          // react-query doesn't like undefined values, so we map them to null
          map((value) => (value === undefined ? null : value)),
        ) as Observable<T>
    )
    // Disabling exhaustive-deps because spreading args makes sense here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, papi, isApiLoaded, ...args])

  return useObservableQuery({
    queryKey: [key, safeStringify(args)],
    observable,
    ...options,
  })
}
