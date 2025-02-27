import { useNavigate, useSearch } from "@tanstack/react-location"

import { TDropdownItem } from "components/Dropdown/DropdownRebranded"
import { useTranslation } from "react-i18next"

const borrowTransactionsFilters = [
  "all",
  "supply",
  "borrow",
  "withdraw",
  "repay",
  "liquidation",
  "collateral",
  "emode",
] as const

export type BorrowTransactionType = (typeof borrowTransactionsFilters)[number]

type FilterValues = {
  readonly type?: BorrowTransactionType
  readonly search?: string
}

export const useLendingTransactionsFilters = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const search = useSearch<{
    Search: {
      type?: BorrowTransactionType
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

  const allTypes = borrowTransactionsFilters.map<
    TDropdownItem<BorrowTransactionType>
  >((filter) => ({
    key: filter,
    label: (() => {
      switch (filter) {
        case "all":
          return t("lending.transactions.event.all")
        case "borrow":
          return t("lending.transactions.event.borrow")
        case "collateral":
          return t("lending.transactions.event.collateral")
        case "emode":
          return t("lending.transactions.event.emode")
        case "liquidation":
          return t("lending.transactions.event.liquidation")
        case "repay":
          return t("lending.transactions.event.repay")
        case "supply":
          return t("lending.transactions.event.supply")
        case "withdraw":
          return t("lending.transactions.event.withdraw")
        default:
          return ""
      }
    })(),
  }))

  return {
    allTypes,
    activeType: search.type ?? "All",
    search: search.search ?? "",
    setFilter,
  }
}
