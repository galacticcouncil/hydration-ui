import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  TableContainer,
  Table,
  TableBodyContent,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useTransactionsTable } from "./TransactionsTable.utils"
import { TTransactionsTableData } from "./data/TransactionsTableData.utils"
import { useTranslation } from "react-i18next"
import { getSubscanLinkByType } from "utils/formatting"
import { Fragment, useRef } from "react"
import { isSameDay, startOfDay } from "date-fns"
import { TransactionsTypeFilter } from "sections/wallet/transactions/filter/TransactionsTypeFilter"

type Props = {
  data: TTransactionsTableData
}

export const TransactionsTable = ({ data }: Props) => {
  const { t } = useTranslation()

  const lastDateRef = useRef<Date | null>(null)

  const table = useTransactionsTable(data)

  const onRowSelect = (hash: string) => {
    window.open(`${getSubscanLinkByType("extrinsic")}/${hash}`, "_blank")
  }

  return (
    <TableContainer sx={{ bg: "darkBlue700" }}>
      <TableTitle css={{ border: 0 }}>
        <Text
          fs={14}
          lh={20}
          css={{ fontFamily: "FontOver" }}
          fw={500}
          color="white"
        >
          {t("wallet.transactions.table.header.title")}
        </Text>
      </TableTitle>
      <TransactionsTypeFilter />
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id} header>
              {hg.headers.map((header) => (
                <TableSortHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
                  css={{
                    "&": {
                      fontSize: 11,
                      fontWeight: 500,
                      paddingTop: 14,
                      paddingBottom: 14,
                    },
                  }}
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableSortHeader>
              ))}
            </TableRow>
          ))}
        </TableHeaderContent>
        <TableBodyContent>
          {table.getRowModel().rows.map((row, index) => {
            const date = startOfDay(new Date(row.original.date))

            const isFirst = index === 0
            const isRepeatDay = isSameDay(lastDateRef.current ?? 0, date)
            if (!isRepeatDay) {
              lastDateRef.current = date
            }

            const shouldRenderDateRow = isFirst || !isRepeatDay

            return (
              <Fragment key={row.id}>
                {shouldRenderDateRow && (
                  <TableRow>
                    <TableData
                      css={{
                        "&": {
                          paddingTop: 16,
                          paddingBottom: 8,
                          pointerEvents: "none",
                        },
                      }}
                      colSpan={table.getAllColumns().length}
                    >
                      <Text fs={12} color="darkBlue200">
                        {t("stats.overview.chart.tvl.label.date", {
                          date,
                        })}
                      </Text>
                    </TableData>
                  </TableRow>
                )}
                <TableRow css={{ cursor: "pointer" }}>
                  {row.getVisibleCells().map((cell) => (
                    <TableData
                      key={cell.id}
                      css={{
                        "&": {
                          paddingTop: 14,
                          paddingBottom: 14,
                        },
                        "&:last-of-type": {
                          paddingLeft: 0,
                        },
                      }}
                      onClick={() => onRowSelect(row.original.extrinsicHash)}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableData>
                  ))}
                </TableRow>
              </Fragment>
            )
          })}
        </TableBodyContent>
      </Table>
    </TableContainer>
  )
}
