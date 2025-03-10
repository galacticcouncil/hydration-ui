import { useNavigate, useSearch } from "@tanstack/react-location"

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
  const navigate = useNavigate<{ readonly Search: LendingHistorySearch }>()
  const search = useSearch<{ readonly Search: LendingHistorySearch }>()

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
