import { useNavigate, useSearch } from "@tanstack/react-location"
import { useCallback } from "react"

export const useSearchFilter = () => {
  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      search?: string
      id?: number
    }
  }>()

  const setSearchParam = useCallback(
    (searchAsset: string) =>
      navigate({
        search: {
          ...search,
          search: searchAsset.length > 0 ? searchAsset : undefined,
        },
      }),
    [navigate, search],
  )

  return { search: search.search, setSearchParam }
}
