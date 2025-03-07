import {
  getPaginationRowModel,
  OnChangeFn,
  PaginationState,
} from "@tanstack/react-table"
import { DataTable, TableContainer, TableTitle } from "components/DataTable"
import { TablePagination } from "components/Table/TablePagination"
import { Text } from "components/Typography/Text/Text"
import { useReactTable } from "hooks/useReactTable"
import { FC, useMemo } from "react"
import { useLendingTransactionsColumns } from "sections/lending/subsections/transactions/LendingTransactionsTable.columns"
import { useMoneyMarketEvents } from "sections/lending/subsections/transactions/LendingTransactionsTable.query"
import { LendingTransactionsFilter } from "sections/lending/subsections/transactions/LendingTransactionsFilter"
import { useSearch } from "@tanstack/react-location"
import styled from "@emotion/styled"
import { theme } from "theme"
import { css } from "@emotion/react"
import { mapMoneyMarketEvents } from "sections/lending/subsections/transactions/LendingTransactionsTable.utils"
import { useTranslation } from "react-i18next"
import { LendingTransactionsSearch } from "sections/lending/subsections/transactions/LendingTransactionsFilter.utils"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"

type Props = {
  readonly searchPhrase: string
  readonly pagination: PaginationState
  readonly onPaginationChange: OnChangeFn<PaginationState>
}

const tableStyles = css`
  border-width: 0;
  border-top-width: 1px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
`

const SDataTable = styled(DataTable)`
  ${tableStyles}

  @media ${theme.viewport.gte.sm} {
    ${tableStyles}
  }
` as typeof DataTable

export const LendingTransactionsTable: FC<Props> = ({
  searchPhrase,
  pagination,
  onPaginationChange,
}) => {
  const { t } = useTranslation()
  const { type } = useSearch<{ readonly Search: LendingTransactionsSearch }>()

  const { data, isLoading } = useMoneyMarketEvents(
    type,
    searchPhrase,
    pagination,
  )

  const eventsWithDays = useMemo(() => mapMoneyMarketEvents(data), [data])

  const table = useReactTable({
    columns: useLendingTransactionsColumns(),
    data: eventsWithDays,
    isLoading,
    state: { pagination },
    autoResetPageIndex: false,
    rowCount: data?.moneyMarketEvents?.totalCount ?? 0,
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: onPaginationChange,
  })

  return (
    <TableContainer sx={{ bg: "darkBlue700" }}>
      <TableTitle css={{ border: 0 }} sx={{ px: [20, 30], py: [14, 24] }}>
        <Text
          fs={[15, 20]}
          lh={[20, 26]}
          font="GeistMono"
          fw={500}
          color="white"
        >
          {t("lending.transactions.table.title")}
        </Text>
      </TableTitle>
      <div sx={{ px: 20, pb: 20 }}>
        <LendingTransactionsFilter
          onChange={() =>
            onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
          }
        />
      </div>
      {eventsWithDays.length ? (
        <SDataTable table={table} />
      ) : (
        <EmptySearchState />
      )}
      <TablePagination table={table} />
    </TableContainer>
  )
}
