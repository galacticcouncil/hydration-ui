import { useMatch, useNavigate, useSearch } from "@tanstack/react-router"

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

/** The history page is mounted under both money markets. */
export const useBorrowHistoryRoute = () =>
  useMatch({ from: "/money-market/history", shouldThrow: false })
    ? ("/money-market/history" as const)
    : ("/borrow/history" as const)

export const useBorrowHistoryFilters = () => {
  const from = useBorrowHistoryRoute()
  const navigate = useNavigate({ from })
  const search = useSearch({ from })

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
