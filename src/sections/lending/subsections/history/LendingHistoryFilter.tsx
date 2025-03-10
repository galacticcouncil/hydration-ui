import { FC } from "react"
import {
  LendingHistoryFilterType,
  lendingHistoryFilters,
  useLendingHistoryFilters,
} from "sections/lending/subsections/history/LendingHistoryFilter.utils"
import { useTranslation } from "react-i18next"
import { TDropdownItem } from "components/Dropdown/DropdownRebranded"
import {
  DropdownMulti,
  DropdownMultiTrigger,
} from "components/Dropdown/DropdownMulti"

type Props = {
  readonly onChange: () => void
}

export const LendingHistoryFilter: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation()
  const { activeFilters, setFilter } = useLendingHistoryFilters()

  const dropdownItems = lendingHistoryFilters.map<
    TDropdownItem<LendingHistoryFilterType>
  >((filter) => ({
    key: filter,
    label: (() => {
      switch (filter) {
        case "borrow":
          return t("lending.history.event.borrow")
        case "collateral":
          return t("lending.history.event.collateral")
        case "emode":
          return t("lending.history.event.emode")
        case "liquidation":
          return t("lending.history.event.liquidation")
        case "repay":
          return t("lending.history.event.repay")
        case "supply":
          return t("lending.history.event.supply")
        case "withdraw":
          return t("lending.history.event.withdraw")
      }
    })(),
  }))

  return (
    <DropdownMulti
      items={dropdownItems}
      withAllOption
      selectedKeys={activeFilters ?? lendingHistoryFilters}
      onSelect={(filters) => {
        setFilter(
          filters.length && filters.length < lendingHistoryFilters.length
            ? filters
            : undefined,
        )
        onChange()
      }}
    >
      <DropdownMultiTrigger title={t("lending.history.filter.title")} />
    </DropdownMulti>
  )
}
