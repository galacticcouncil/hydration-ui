import { useNavigate, useSearch } from "@tanstack/react-router"

export const lendingHistoryFilters = [
  "supply",
  "borrow",
  "withdraw",
  "repay",
  "liquidation",
  "collateral",
  "emode",
] as const

export type LendingHistoryFilterType = (typeof lendingHistoryFilters)[number]

export type LendingHistorySearch = {
  readonly type?: ReadonlyArray<LendingHistoryFilterType>
  readonly search?: string
}

export const useLendingHistoryFilters = () => {
  const navigate = useNavigate({
    from: "/borrow/history",
  })
  const search = useSearch({
    from: "/borrow/history",
  })

  const setFilter = (
    filters: ReadonlyArray<LendingHistoryFilterType> | undefined,
  ) => {
    navigate({
      search: {
        ...search,
        type: filters,
      },
    })
  }

  return {
    activeFilters: search.type,
    search: search.search ?? "",
    setFilter,
  }
}
