import { useNavigate, useSearch } from "@tanstack/react-router"

export const borrowHistoryFilters = [
  "supply",
  "borrow",
  "withdraw",
  "repay",
  "liquidation",
  "collateral",
  "emode",
] as const

export type BorrowHistoryFilterType = (typeof borrowHistoryFilters)[number]

export type BorrowHistorySearch = {
  readonly type?: ReadonlyArray<BorrowHistoryFilterType>
  readonly search?: string
}

export const useBorrowHistoryFilters = () => {
  const navigate = useNavigate({
    from: "/borrow/history",
  })
  const search = useSearch({
    from: "/borrow/history",
  })

  const setFilter = (
    filters: ReadonlyArray<BorrowHistoryFilterType> | undefined,
  ) => {
    navigate({
      search: (search) => ({
        ...search,
        type: filters,
      }),
    })
  }

  return {
    activeFilters: search.type,
    setFilter,
  }
}
