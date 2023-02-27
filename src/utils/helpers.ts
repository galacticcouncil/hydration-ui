import { UseQueryResult } from "@tanstack/react-query"
import { useEffect, useState } from "react"
import { UseFormReturn } from "react-hook-form"
import { u32 } from "@polkadot/types-codec"

export const noop = () => {}
export const undefinedNoop = () => undefined

export type Maybe<T> = T | null | undefined
export type FormValues<T> = T extends UseFormReturn<infer Values>
  ? Values
  : never

export function isRecord<Key extends string, Value>(
  x: unknown,
): x is Record<Key, Value> {
  return typeof x === "object" && x != null && !Array.isArray(x)
}

export function keys<O extends object>(o: O) {
  return Object.keys(o) as (keyof O)[]
}

/**
 * This hook allows us to modify the `data` property and pass through
 * other React Query keys while not triggering unnecessary renders due to object spread
 *
 * https://github.com/TkDodo/blog-comments/discussions/59#discussioncomment-3827243
 *
 * @param queryResult Query result to wrap
 * @param selector Function which transforms the data if not undefined
 * @returns Query result with transformed data
 */
export function useQuerySelect<TData, TError, TNewData>(
  queryResult: UseQueryResult<TData, TError>,
  selector: (data: TData) => TNewData,
) {
  const trackedItem = {} as UseQueryResult<TNewData, TError>

  // keys will not trigger the tracking of prop
  Object.keys(queryResult).forEach((i) => {
    const key = i as keyof typeof queryResult

    Object.defineProperty(trackedItem, key, {
      configurable: false,
      enumerable: true,
      get: () => {
        if (key === "data") {
          if (typeof queryResult["data"] === "undefined") return undefined
          return selector(queryResult["data"])
        }

        return queryResult[key]
      },
    })
  })

  return trackedItem
}

export const useNow = (enabled: boolean) => {
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    if (!enabled) return
    const interval = window.setInterval(() => setNow(new Date()), 500)
    return () => window.clearInterval(interval)
  }, [enabled])

  return now
}

export function normalizeId(id: string | u32) {
  return id.toString()
}

export function isNil<T>(val: T | null | undefined): val is null | undefined {
  return val === undefined || val === null
}

export function isNotNil<T>(val: T | null | undefined): val is T {
  return !isNil(val)
}

const validKeys = [
  "data",
  "isError",
  "isFetching",
  "isLoading",
  "isLoadingError",
  "isInitialLoading",
  "isPaused",
  "isPlaceholderData",
  "isPreviousData",
  "isRefetchError",
  "isRefetching",
  "isStale",
  "isSuccess",
  "isFetched",
  "isFetchedAfterMount",
] as const

type UseQueryReduceResult<T> = Pick<UseQueryResult<T>, typeof validKeys[number]>

type TupleQueryResult<Tuple extends readonly unknown[]> = {
  [P in keyof Tuple]: UseQueryReduceResult<Tuple[P]> | UseQueryResult<Tuple[P]>
}

export function useQueryReduce<Tuple extends readonly unknown[], Combined>(
  list: TupleQueryResult<Tuple>,
  second: (...args: [...Tuple]) => Combined,
) {
  const trackedItem = {} as UseQueryReduceResult<Combined>

  for (const key of validKeys) {
    Object.defineProperty(trackedItem, key, {
      configurable: false,
      enumerable: true,
      get: () => {
        switch (key) {
          case "data": {
            const data = list.map((i) => i.data) as [...Tuple]
            if (data.some((x) => typeof x === "undefined")) return undefined
            return second(...data)
          }
          case "isError":
          case "isFetching":
          case "isLoading":
          case "isLoadingError":
          case "isInitialLoading":
          case "isPaused":
          case "isPlaceholderData":
          case "isPreviousData":
          case "isRefetchError":
          case "isRefetching":
          case "isStale": {
            const result = list.map((i) => i[key])
            return result.some((i) => i)
          }
          case "isSuccess":
          case "isFetched":
          case "isFetchedAfterMount": {
            const result = list.map((i) => i[key])
            return result.every((i) => i)
          }
          default: {
            return undefined
          }
        }
      },
    })
  }

  return trackedItem
}
