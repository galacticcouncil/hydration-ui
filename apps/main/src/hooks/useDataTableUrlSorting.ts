import { updateTableSortWithPriority } from "@galacticcouncil/ui/components"
import {
  RegisteredRouter,
  RouteById,
  RouteIds,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { OnChangeFn, SortingState } from "@tanstack/react-table"
import { useMemo } from "react"

type RouteId = RouteIds<RegisteredRouter["routeTree"]>

type SearchParams<TRouteId extends RouteId> = RouteById<
  RegisteredRouter["routeTree"],
  TRouteId
>["types"]["fullSearchSchema"]

type SortingKeys<T> = {
  [K in keyof T]: T[K] extends SortingState ? K : never
}[keyof T]

export type SortingProps = ReturnType<typeof useDataTableUrlSorting>

export const useDataTableUrlSorting = <TRouteId extends RouteId>(
  url: TRouteId,
  pageParam: SortingKeys<SearchParams<TRouteId>> & string,
  columnPriority?: ReadonlyArray<string>,
) => {
  const navigate = useNavigate()

  const sorting = useSearch({
    from: url,
    select: (params) => params[pageParam] as SortingState,
  })

  const onSortingChange = useMemo(
    (): OnChangeFn<SortingState> => async (updater) => {
      const newState =
        typeof updater === "function" ? updater(sorting) : updater

      const sortWithPriority = columnPriority
        ? updateTableSortWithPriority(newState, columnPriority)
        : newState

      navigate({
        to: ".",
        search: (search) => ({ ...search, [pageParam]: sortWithPriority }),
        resetScroll: false,
      })
    },
    [pageParam, columnPriority, sorting, navigate],
  )

  return { sorting, onSortingChange }
}
