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
import { useLiquidityProvidersTable } from "./LiquidityProvidersTable.utils"
import { Icon } from "components/Icon/Icon"
import TitleIcon from "assets/icons/StakingTableIcon.svg?react"

type Props = {
  data: any
}

export const LiquidityProvidersTable = ({ data }: Props) => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const onRowSelect = (account: string) => {
    window.open(`https://hydradx.subscan.io/account/${account}`, "_blank")
  }

  const table = useLiquidityProvidersTable(data)

  return (
    <StatsTableContainer>
      <StatsTableTitle>
        <div sx={{ flex: "row", align: "center", gap: 12 }}>
          <Icon sx={{ color: "white" }} icon={<TitleIcon />} />
          <Text
            fs={[16, 24]}
            lh={[24, 26]}
            color="white"
            font="ChakraPetchBold"
          >
            {t("stats.omnipool.table.providers.title")}
          </Text>
        </div>
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
              onClick={() => onRowSelect(row.original.account)}
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
