import { useNavigate, useSearch } from "@tanstack/react-location"

type AssetCategory = "all" | "assets" | "liquidity" | "farming"

type FilterValues = {
  category?: AssetCategory
  search?: string
}

export const useWalletAssetsFilters = () => {
  const navigate = useNavigate()
  const { search, category } = useSearch<{
    Search: {
      category?: AssetCategory
      search?: string
    }
  }>()

  const setFilter = (filter: Partial<FilterValues>) => {
    navigate({
      search: {
        search,
        category,
        ...filter,
      },
    })
  }

  return {
    category: category ?? "all",
    search: search ?? "",
    setFilter,
  }
}
