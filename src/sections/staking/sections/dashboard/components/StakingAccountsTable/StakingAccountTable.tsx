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
import { useStakingAccountsTable } from "./StakingAccountTable.utils"
import { Icon } from "components/Icon/Icon"
import { ReactComponent as StakinTableIcon } from "assets/icons/StakingTableIcon.svg"
import { SContainer } from "sections/staking/StakingPage.styled"
import { css } from "@emotion/react"

export const tableStyles = css`
  th {
    &:nth-last-of-type(1) {
      > div {
        justify-content: flex-end;
      }
    }

    @media ${theme.viewport.gte.sm} {
      &:nth-last-of-type(2) {
        > div {
          justify-content: flex-end;
        }
      }
    }
  }
`

//TODO: Connect data
export const StakingAccountTable = () => {
  const { t } = useTranslation()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const table = useStakingAccountsTable()

  return (
    <SContainer>
      <StatsTableContainer css={tableStyles}>
        <StatsTableTitle>
          <div sx={{ flex: "row", align: "center", gap: 12, mt: [0, 20] }}>
            <Icon sx={{ color: "white" }} icon={<StakinTableIcon />} />
            <Text
              fs={[18, 24]}
              lh={[24, 26]}
              color="white"
              font="ChakraPetchBold"
            >
              {t("staking.dashboard.table.title")}
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
                            "&:first-of-type > div": {
                              justifyContent: "flex-start",
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
              <TableRowStats key={row.id} css={{ cursor: "pointer" }}>
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
    </SContainer>
  )
}
