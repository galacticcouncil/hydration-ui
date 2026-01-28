import { DATA_TABLE_DEFAULT_PAGE_SIZE } from "@galacticcouncil/ui/components"
import {
  RegisteredRouter,
  RouteById,
  RouteIds,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { PaginationState } from "@tanstack/react-table"
import { useCallback, useMemo } from "react"

type RouteId = RouteIds<RegisteredRouter["routeTree"]>

type SearchParams<TRouteId extends RouteId> = RouteById<
  RegisteredRouter["routeTree"],
  TRouteId
>["types"]["fullSearchSchema"]

type NumericKeys<T> = {
  [K in keyof T]: T[K] extends number | undefined | null ? K : never
}[keyof T]

export type PaginationProps = ReturnType<typeof useDataTableUrlPagination>

export const useDataTableUrlPagination = <TRouteId extends RouteId>(
  url: TRouteId,
  pageParam: NumericKeys<SearchParams<TRouteId>> & string,
  pageSize = DATA_TABLE_DEFAULT_PAGE_SIZE,
) => {
  const navigate = useNavigate()

  const pageNumber = useSearch({
    from: url,
    select: (params) => (params[pageParam] as number | undefined) ?? 1,
  })

  const pagination = useMemo(
    (): PaginationState => ({
      pageIndex: pageNumber - 1,
      pageSize,
    }),
    [pageNumber, pageSize],
  )

  const onPageClick = useCallback(
    (page: number) =>
      navigate({
        to: ".",
        search: (search) => ({ ...search, [pageParam]: page }),
        resetScroll: false,
        replace: true,
      }),
    [navigate, pageParam],
  )

  return { pagination, onPageClick }
}
