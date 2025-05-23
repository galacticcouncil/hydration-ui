import { Combobox } from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import {
  lendingHistoryFilters,
  useLendingHistoryFilters,
} from "@/modules/borrow/history/LendingHistoryFilter.utils"

type Props = {
  readonly onChange: () => void
}

export const LendingHistoryFilter: FC<Props> = ({ onChange }) => {
  const { t } = useTranslation(["borrow"])
  const { activeFilters, setFilter } = useLendingHistoryFilters()

  const dropdownItems = lendingHistoryFilters.map((filter) => ({
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
      label={t("history.filter.title")}
      selectedItems={activeFilters}
      onSelectionChange={(filters) => {
        setFilter(
          filters.length && filters.length < lendingHistoryFilters.length
            ? filters
            : undefined,
        )
        onChange()
      }}
    />
  )
}
