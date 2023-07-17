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
import { useOmnipoolAssetsTable } from "./OmnipoolAssetsTable.utils"
import { TOmnipoolAssetsTableData } from "./data/OmnipoolAssetsTableData.utils"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { useNavigate } from "@tanstack/react-location"

type Props = {
  data: TOmnipoolAssetsTableData
}

export const OmnipoolAssetsTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const navigate = useNavigate()

  const onRowSelect = (assetId: string) => {
    // TODO
    console.log(assetId)
    navigate({
      to: "omnipool",
      search: { asset: assetId },
    })
  }

  const table = useOmnipoolAssetsTable(data)

  return (
    <StatsTableContainer>
      <StatsTableTitle>
        <Text fs={[16, 24]} lh={[24, 26]} color="white" font="ChakraPetchBold">
          {t("stats.overview.table.assets.header.title")}
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
