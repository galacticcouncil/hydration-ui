import { useQueryClient } from "@tanstack/react-query"
import { useSyncExternalStore } from "react"

export function useActiveQueries(queryKey: string[]) {
  const queryClient = useQueryClient()

  return useSyncExternalStore(
    queryClient.getQueryCache().subscribe,
    () =>
      queryClient.getQueriesData({
        queryKey,
        predicate: (q) => !!q.getObserversCount(),
      }).length,
  )
}
