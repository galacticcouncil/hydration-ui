import { useMedia } from "react-use"
import { SFilterButton } from "sections/wallet/transactions/filter/TransactionsTypeFilter.styled"

import { FC } from "react"
import {
  BorrowTransactionType,
  useLendingTransactionsFilters,
} from "sections/lending/subsections/transactions/LendingTransactionsFilter.utils"

type Props = {
  readonly onChange: (type: BorrowTransactionType) => void
}

export const LendingTransactionsFilter: FC<Props> = ({ onChange }) => {
  const { allTypes, activeType, setFilter } = useLendingTransactionsFilters()

  const isNarrow = useMedia("(max-width: 900px)")

  return (
    <div
      sx={{
        px: [16, 32],
      }}
      css={{
        display: "grid",
        gridAutoFlow: "column",
        gridTemplateRows: isNarrow ? "auto auto" : "auto",
        columnGap: 8,
        rowGap: 4,
      }}
    >
      {allTypes.map(({ key, label }) => (
        <SFilterButton
          key={key}
          active={activeType === key}
          onClick={() => setFilter({ type: key })}
        >
          {label}
        </SFilterButton>
      ))}
    </div>
  )
}
