import { FC } from "react"
import {
  BorrowTransactionFilter,
  borrowTransactionsFilters,
  useLendingTransactionsFilters,
} from "sections/lending/subsections/transactions/LendingTransactionsFilter.utils"
import { useTranslation } from "react-i18next"
import { TDropdownItem } from "components/Dropdown/DropdownRebranded"
import {
  DropdownMulti,
  DropdownMultiTrigger,
} from "components/Dropdown/DropdownMulti"

type Props = {
  readonly onChange: () => void
}

export const LendingTransactionsFilter: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation()
  const { activeFilters, setFilter } = useLendingTransactionsFilters()

  const dropdownItems = borrowTransactionsFilters.map<
    TDropdownItem<BorrowTransactionFilter>
  >((filter) => ({
    key: filter,
    label: (() => {
      switch (filter) {
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
      }
    })(),
  }))

  return (
    <DropdownMulti
      items={dropdownItems}
      withAllOption
      selectedKeys={activeFilters ?? borrowTransactionsFilters}
      onSelect={(filters) => {
        setFilter(
          filters.length && filters.length < borrowTransactionsFilters.length
            ? filters
            : undefined,
        )
        onChange()
      }}
    >
      <DropdownMultiTrigger title={t("lending.transactions.filter.title")} />
    </DropdownMulti>
  )
}
