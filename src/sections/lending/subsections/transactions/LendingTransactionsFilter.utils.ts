import { useNavigate, useSearch } from "@tanstack/react-location"

export const borrowTransactionsFilters = [
  "supply",
  "borrow",
  "withdraw",
  "repay",
  "liquidation",
  "collateral",
  "emode",
] as const

export type BorrowTransactionFilter = (typeof borrowTransactionsFilters)[number]

export type LendingTransactionsSearch = {
  readonly type?: ReadonlyArray<BorrowTransactionFilter>
  readonly search?: string
}

export const useLendingTransactionsFilters = () => {
  const navigate = useNavigate<{ readonly Search: LendingTransactionsSearch }>()
  const search = useSearch<{ readonly Search: LendingTransactionsSearch }>()

  const setFilter = (
    filters: ReadonlyArray<BorrowTransactionFilter> | undefined,
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
