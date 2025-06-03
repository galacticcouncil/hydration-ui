import {
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { useRef } from "react"
import { isObservable, Observable } from "rxjs"

import { useObservable } from "@/hooks/useObservable"

export type UseBaseObservableQueryOptions = {
  enabled?: boolean
}

export type UseObservableQueryOptions<T> = UseBaseObservableQueryOptions &
  Omit<
    UseQueryOptions<T, Error, T>,
    "queryFn" | "staleTime" | "refetchOnWindowFocus" | "enabled"
  > & {
    observable?: Observable<T>
    onUpdate?: (data: T) => void
  }

export const useObservableQuery = <T>(
  options: UseObservableQueryOptions<T>,
) => {
  const queryClient = useQueryClient()

  const { observable, queryKey, enabled, onUpdate, ...queryOptions } = options

  const { promise, resolve } = useRef(Promise.withResolvers<T>()).current

  const isEnabled = (enabled ?? true) && isObservable(observable)

  useObservable(observable, {
    enabled: isEnabled,
    onUpdate: (data) => {
      resolve(data)
      queryClient.setQueryData(queryKey, data)
      onUpdate?.(data)
    },
  })

  return useQuery({
    enabled: isEnabled,
    queryKey,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => promise,
    ...queryOptions,
  })
}
