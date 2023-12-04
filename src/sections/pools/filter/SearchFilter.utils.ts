import { useNavigate, useSearch } from "@tanstack/react-location"
import { useCallback } from "react"

export const useSearchFilter = () => {
  const navigate = useNavigate()

  const { search } = useSearch<{
    Search: {
      search?: string
      id?: number
    }
  }>()

  const setSearchParam = useCallback(
    (search?: string) =>
      navigate({
        search: search
          ? {
              search,
            }
          : undefined,
      }),
    [navigate],
  )

  return { search, setSearchParam }
}
