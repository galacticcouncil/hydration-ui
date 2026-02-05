import { updateTableSortWithPriority } from "@galacticcouncil/ui/components"
import {
  RegisteredRouter,
  RouteById,
  RouteIds,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { OnChangeFn, SortingState } from "@tanstack/react-table"
import { useEffect, useMemo, useRef } from "react"

type RouteId = RouteIds<RegisteredRouter["routeTree"]>

type SearchParams<TRouteId extends RouteId> = RouteById<
  RegisteredRouter["routeTree"],
  TRouteId
>["types"]["fullSearchSchema"]

type SortingKeys<T> = {
  [K in keyof T]: T[K] extends SortingState ? K : never
}[keyof T]

export type SortingProps = ReturnType<typeof useDataTableUrlSorting>

type Options = {
  readonly onChange?: (sorting: SortingState) => void
  readonly columnPriority?: ReadonlyArray<string>
}

export const useDataTableUrlSorting = <TRouteId extends RouteId>(
  url: TRouteId,
  sortingParam: SortingKeys<SearchParams<TRouteId>> & string,
  options?: Options,
) => {
  const navigate = useNavigate()

  const sorting = useSearch({
    from: url,
    select: (params) => params[sortingParam] as SortingState,
  })

  const onChangeRef = useRef(options?.onChange)
  useEffect(() => {
    onChangeRef.current = options?.onChange
  }, [options?.onChange])

  const onSortingChange = useMemo(
    (): OnChangeFn<SortingState> => async (updater) => {
      const newState =
        typeof updater === "function" ? updater(sorting) : updater

      const sortWithPriority = options?.columnPriority
        ? updateTableSortWithPriority(newState, options.columnPriority)
        : newState

      onChangeRef.current?.(sortWithPriority)

      navigate({
        to: ".",
        search: (search) => ({ ...search, [sortingParam]: sortWithPriority }),
        resetScroll: false,
        replace: true,
      })
    },
    [sortingParam, options?.columnPriority, sorting, navigate],
  )

  return { sorting, onSortingChange }
}
