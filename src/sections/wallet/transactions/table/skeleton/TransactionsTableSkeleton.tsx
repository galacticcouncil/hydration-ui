import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TableRow,
  TableTitle,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useTranslation } from "react-i18next"
import { useTransactionsTableSkeleton } from "./TransactionsTableSkeleton.utils"

export const TransactionsTableSkeleton = () => {
  const { t } = useTranslation()
  const table = useTransactionsTableSkeleton()

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
          {table.getRowModel().rows.map((row) => (
            <TableRow key={row.id} css={{ cursor: "pointer" }}>
              {row.getVisibleCells().map((cell) => (
                <TableData
                  key={cell.id}
                  css={{
                    "&": {
                      paddingTop: 18,
                      paddingBottom: 18,
                    },
                    "&:last-of-type": {
                      paddingLeft: 0,
                    },
                  }}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableData>
              ))}
            </TableRow>
          ))}
        </TableBodyContent>
      </Table>
    </TableContainer>
  )
}
