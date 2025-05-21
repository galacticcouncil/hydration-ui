import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from "@tanstack/react-query"
import { useRef } from "react"
import { isObservable, Observable } from "rxjs"

import { useObservable } from "@/hooks/useObservable"

type UseObservableQueryOptions<T> = Omit<
  UseQueryOptions<T, Error, T>,
  "queryFn"
> & {
  queryKey: QueryKey
  observable?: Observable<T>
}

export const useObservableQuery = <T>(
  options: UseObservableQueryOptions<T | null>,
) => {
  const queryClient = useQueryClient()

  const { observable, queryKey, ...queryOptions } = options

  const resolverRef = useRef<((value: T | null) => void) | null>(null)

  useObservable(observable, (value) => {
    const data = value || null
    queryClient.setQueriesData<T | null>({ queryKey }, data)
    resolverRef.current?.(data)
    resolverRef.current = null
  })

  return useQuery({
    enabled: isObservable(observable),
    queryKey,
    staleTime: Infinity,
    refetchOnWindowFocus: false,
    queryFn: () => {
      // Use queryFn to keep query in "loading" state until observable pushes data.
      // Will resolve once observable emits and cache is populated.
      return new Promise<T | null>((resolve) => {
        resolverRef.current = resolve
      })
    },
    ...queryOptions,
  })
}
