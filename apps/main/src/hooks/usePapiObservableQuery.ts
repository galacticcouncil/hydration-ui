import { safeStringify } from "@galacticcouncil/utils"
import { useEffect, useMemo, useRef } from "react"
import { Observable } from "rxjs"

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

type InferObservableArgs<T> = T extends {
  watchValue: (...args: infer A) => unknown
}
  ? A
  : never

type InferObservableReturn<T> = T extends {
  getValue: (...args: never[]) => Promise<infer U>
}
  ? Exclude<U, undefined>
  : never

type PapiObservableKey = keyof typeof PAPI_OBSERVER_MAP
type PapiObservableFn<K extends PapiObservableKey> =
  (typeof PAPI_OBSERVER_MAP)[K]
type PapiObservable<K extends PapiObservableKey> = ReturnType<
  PapiObservableFn<K>
>
type PapiObservableArgs<K extends PapiObservableKey> = InferObservableArgs<
  PapiObservable<K>
>

type PapiObservableReturn<K extends PapiObservableKey> = InferObservableReturn<
  PapiObservable<K>
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

  const argsRef = useRef(args)
  useEffect(() => {
    argsRef.current = args
  }, [args])

  const observable = useMemo(() => {
    if (!isApiLoaded) return
    const observable = PAPI_OBSERVER_MAP[key](papi)
    // @ts-expect-error Args are union here, so TS complains, but they are correctly inferred in the input of the function
    return observable.watchValue(...argsRef.current) as Observable<T>
  }, [papi, isApiLoaded, key])

  return useObservableQuery({
    queryKey: [key, safeStringify(args)],
    observable,
    ...options,
  })
}
