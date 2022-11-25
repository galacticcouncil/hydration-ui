import { UseQueryResult } from "@tanstack/react-query"
import { useEffect, useRef, useState } from "react"
import { UseFormReturn } from "react-hook-form"

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
