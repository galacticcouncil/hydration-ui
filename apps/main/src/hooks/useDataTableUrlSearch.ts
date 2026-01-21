import {
  RegisteredRouter,
  RouteById,
  RouteIds,
  useNavigate,
  useSearch,
} from "@tanstack/react-router"
import { useCallback } from "react"

type RouteId = RouteIds<RegisteredRouter["routeTree"]>

type SearchParams<TRouteId extends RouteId> = RouteById<
  RegisteredRouter["routeTree"],
  TRouteId
>["types"]["fullSearchSchema"]

type SearchKeys<T> = {
  [K in keyof T]: T[K] extends string | undefined ? K : never
}[keyof T]

export type SearchProps = ReturnType<typeof useDataTableUrlSearch>

export const useDataTableUrlSearch = <TRouteId extends RouteId>(
  url: TRouteId,
  searchParam: SearchKeys<SearchParams<TRouteId>> & string,
) => {
  const navigate = useNavigate()

  const searchPhrase = useSearch({
    from: url,
    select: (params) => params[searchParam] as string | undefined,
  })

  const onSearchChange = useCallback(
    (searchPhrase: string) =>
      navigate({
        to: ".",
        search: (search) => ({ ...search, [searchParam]: searchPhrase }),
        resetScroll: false,
        replace: true,
      }),
    [searchParam, navigate],
  )

  return [searchPhrase ?? "", onSearchChange] as const
}
