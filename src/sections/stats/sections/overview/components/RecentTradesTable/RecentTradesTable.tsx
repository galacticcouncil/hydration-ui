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
import { useTranslation } from "react-i18next"
import { useRecentTradesTable } from "./RecentTradesTable.utils"
import { TRecentTradesTableData } from "./data/RecentTradesTableData.utils"

type Props = {
  data: TRecentTradesTableData
}

export const RecentTradesTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const onRowSelect = (assetId: string) => {
    // TODO
    console.log(assetId)
  }

  const table = useRecentTradesTable(data)

  return (
    <StatsTableContainer>
      <StatsTableTitle>
        <Text fs={[16, 24]} lh={[24, 26]} color="white" font="ChakraPetchBold">
          Recent Trades
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
                      ? {
                          "&:first-of-type > div": {
                            justifyContent: "flex-start",
                          },
                          "&:nth-last-of-type(2) > div": {
                            justifyContent: "flex-end",
                          },
                        }
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
          {table.getRowModel().rows.map((row, i) => (
            <TableRowStats
              onClick={() => onRowSelect(row.original.id)}
              key={row.id}
              css={{ cursor: "pointer" }}
            >
              {row.getVisibleCells().map((cell) => (
                <TableData
                  key={cell.id}
                  css={{
                    "&:last-of-type": {
                      paddingLeft: 0,
                    },
                  }}
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
