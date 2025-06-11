import { Combobox } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  borrowHistoryFilters,
  useBorrowHistoryFilters,
} from "@/modules/borrow/history/BorrowHistoryFilter.utils"

type Props = {
  readonly onChange: () => void
}

export const BorrowHistoryFilter: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation(["common", "borrow"])
  const { activeFilters, setFilter } = useBorrowHistoryFilters()

  const dropdownItems = borrowHistoryFilters.map((filter) => ({
    key: filter,
    label: (() => {
      switch (filter) {
        case "borrow":
          return t("borrow:history.event.borrow")
        case "collateral":
          return t("borrow:history.event.collateral")
        case "emode":
          return t("borrow:history.event.emode")
        case "liquidation":
          return t("borrow:history.event.liquidation")
        case "repay":
          return t("borrow:history.event.repay")
        case "supply":
          return t("borrow:history.event.supply")
        case "withdraw":
          return t("borrow:history.event.withdraw")
      }
    })(),
  }))

  return (
    <Combobox
      items={dropdownItems}
      label={t("borrow:history.filter.title")}
      placeholder={t("all")}
      selectedItems={activeFilters}
      onSelectionChange={(filters) => {
        setFilter(
          filters.length && filters.length < borrowHistoryFilters.length
            ? filters
            : undefined,
        )
        onChange()
      }}
    />
  )
}
