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
import { useLendingHistoryColumns } from "sections/lending/subsections/history/LendingHistoryTable.columns"
import { useMoneyMarketEvents } from "sections/lending/subsections/history/LendingHistoryTable.query"
import { useSearch } from "@tanstack/react-location"
import styled from "@emotion/styled"
import { theme } from "theme"
import { css } from "@emotion/react"
import { mapMoneyMarketEvents } from "sections/lending/subsections/history/LendingHistoryTable.utils"
import { useTranslation } from "react-i18next"
import { LendingHistorySearch } from "sections/lending/subsections/history/LendingHistoryFilter.utils"
import { EmptySearchState } from "components/EmptySearchState/EmptySearchState"
import { LendingHistoryFilter } from "sections/lending/subsections/history/LendingHistoryFilter"

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

export const LendingHistoryTable: FC<Props> = ({
  searchPhrase,
  pagination,
  onPaginationChange,
}) => {
  const { t } = useTranslation()
  const { type } = useSearch<{ readonly Search: LendingHistorySearch }>()

  const { data, isLoading } = useMoneyMarketEvents(
    type,
    searchPhrase,
    pagination,
  )

  const eventsWithDays = useMemo(() => mapMoneyMarketEvents(data), [data])

  const table = useReactTable({
    columns: useLendingHistoryColumns(),
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
    <TableContainer sx={{ bg: "darkBlue700" }} css={{ overflowX: "hidden" }}>
      <TableTitle css={{ border: 0 }} sx={{ px: [20, 30], py: [14, 24] }}>
        <Text
          fs={[15, 20]}
          lh={[20, 26]}
          font="GeistMono"
          fw={500}
          color="white"
        >
          {t("lending.history.table.title")}
        </Text>
      </TableTitle>
      <div sx={{ px: 20, pb: 20 }}>
        <LendingHistoryFilter
          onChange={() =>
            onPaginationChange((prev) => ({ ...prev, pageIndex: 0 }))
          }
        />
      </div>
      {eventsWithDays.length || isLoading ? (
        <SDataTable table={table} />
      ) : (
        <EmptySearchState />
      )}
      <TablePagination table={table} />
    </TableContainer>
  )
}
