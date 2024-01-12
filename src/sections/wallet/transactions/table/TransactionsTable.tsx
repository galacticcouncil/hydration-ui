import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  StatsTableContainer,
  StatsTableTitle,
  Table,
  TableBodyContent,
  TableData,
  TableHeaderContent,
  TableRowStats,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useTransactionsTable } from "./TransactionsTable.utils"
import { TTransactionsTableData } from "./data/TransactionsTableData.utils"
import { useTranslation } from "react-i18next"
import { getSubscanLinkByType } from "utils/formatting"

type Props = {
  data: TTransactionsTableData
}

export const TransactionsTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const table = useTransactionsTable(data)

  const onRowSelect = (hash: string) => {
    window.open(`${getSubscanLinkByType("extrinsic")}/${hash}`, "_blank")
  }

  return (
    <StatsTableContainer
      css={{
        backgroundColor: "rgba(6, 9, 23, 0.4);",
      }}
    >
      <StatsTableTitle>
        <Text fs={[15, 19]} lh={20} color="white" font="FontOver">
          {t("wallet.transactions.table.header.title")}
        </Text>
      </StatsTableTitle>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRowStats key={hg.id} header>
              {hg.headers.map((header) => (
                <TableSortHeader
                  key={header.id}
                  canSort={header.column.getCanSort()}
                  sortDirection={header.column.getIsSorted()}
                  onSort={header.column.getToggleSortingHandler()}
                  css={
                    !isDesktop
                      ? [
                          {
                            "&:first-of-type > div": {
                              justifyContent: "flex-start",
                            },
                          },
                          {
                            "&:nth-of-type(2) > div": {
                              justifyContent: "flex-end",
                              whiteSpace: "nowrap",
                            },
                          },
                        ]
                      : undefined
                  }
                >
                  {flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
                </TableSortHeader>
              ))}
            </TableRowStats>
          ))}
        </TableHeaderContent>
        <TableBodyContent>
          {table.getRowModel().rows.map((row) => (
            <TableRowStats key={row.id} css={{ cursor: "pointer" }}>
              {row.getVisibleCells().map((cell) => (
                <TableData
                  key={cell.id}
                  css={{
                    "&:last-of-type": {
                      paddingLeft: 0,
                    },
                  }}
                  onClick={() => onRowSelect(row.original.extrinsicHash)}
                >
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableData>
              ))}
            </TableRowStats>
          ))}
        </TableBodyContent>
      </Table>
    </StatsTableContainer>
  )
}
