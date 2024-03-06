import { useNavigate, useSearch } from "@tanstack/react-location"
import { TransactionType } from "api/wallet"

type FilterTxType = "all" | TransactionType

type FilterValues = {
  type?: FilterTxType
  search?: string
}

export const useWalletTransactionsFilters = () => {
  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      type?: FilterTxType
      search?: string
    }
  }>()

  const setFilter = (filter: Partial<FilterValues>) => {
    navigate({
      search: {
        ...search,
        ...filter,
      },
    })
  }

  return {
    type: search.type ?? "all",
    search: search.search ?? "",
    setFilter,
  }
}
