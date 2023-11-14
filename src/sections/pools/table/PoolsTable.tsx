import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  StatsTableContainer,
  Table,
  TableBodyContent,
  TableData,
  TableHeaderContent,
  TableRow,
} from "components/Table/Table.styled"
import { Text } from "components/Typography/Text/Text"
import { useMedia } from "react-use"
import { theme } from "theme"
import { useTranslation } from "react-i18next"
import { useOmnipoolPoolTable } from "./PoolsTable.utils"
import { TOmnipoolAsset } from "sections/pools/PoolsPage.utils"
import { useNavigate } from "@tanstack/react-location"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import { useState } from "react"

export const PoolsTable = ({ data }: { data: TOmnipoolAsset[] }) => {
  const [addLiquidityPool, setAddLiquidityPool] = useState<
    TOmnipoolAsset | undefined
  >(undefined)

  const { t } = useTranslation()
  const navigate = useNavigate()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const onRowSelect = (id: string) =>
    navigate({
      search: { id },
    })

  const table = useOmnipoolPoolTable(data, setAddLiquidityPool)

  return (
    <>
      <StatsTableContainer>
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
              </TableRow>
            ))}
          </TableHeaderContent>
          <TableBodyContent>
            {table.getRowModel().rows.map((row, i) => (
              <TableRow
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
              </TableRow>
            ))}
          </TableBodyContent>
        </Table>
      </StatsTableContainer>
      {addLiquidityPool && (
        <AddLiquidity
          isOpen
          onClose={() => setAddLiquidityPool(undefined)}
          pool={addLiquidityPool}
        />
      )}
    </>
  )
}
