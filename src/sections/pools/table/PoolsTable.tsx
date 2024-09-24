import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableData,
  TableHeaderContent,
  TableRow,
} from "components/Table/Table.styled"
import { usePoolTable } from "./PoolsTable.utils"
import { TPool, TXYKPool } from "sections/pools/PoolsPage.utils"
import { useNavigate, useSearch } from "@tanstack/react-location"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"
import { theme } from "theme"
import { css } from "@emotion/react"
import { TablePagination } from "components/Table/TablePagination"
import { useEffect } from "react"
import { useSettingsStore } from "state/store"

const styles = css`
  @media ${theme.viewport.gte.sm} {
    &:last-of-type {
      padding-right: 30px;
      padding-left: 0px;
    }
  }
`

export const PoolsTable = ({
  data,
  isXyk = false,
  paginated,
}: {
  data: TPool[] | TXYKPool[]
  isXyk?: boolean
  paginated?: boolean
}) => {
  const navigate = useNavigate()
  const search = useSearch()
  const { degenMode } = useSettingsStore()

  const onRowSelect = (id: string) =>
    navigate({
      search: { ...search, id },
    })

  useEffect(() => {
    if (paginated) table.setPageIndex(0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, degenMode])

  const table = usePoolTable(data, isXyk, onRowSelect, paginated)

  return (
    <>
      <TableContainer css={assetsTableStyles}>
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
                      width:
                        header.getSize() !== 150 ? header.getSize() : "auto",
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
            {table.getRowModel().rows.map((row, i) => (
              <TableRow
                onClick={() => {
                  onRowSelect(row.original.id)
                }}
                key={row.id}
                css={{ cursor: "pointer" }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableData key={cell.id} css={styles} sx={{ px: [10, 26] }}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableData>
                ))}
              </TableRow>
            ))}
          </TableBodyContent>
        </Table>
        {paginated && <TablePagination table={table} />}
      </TableContainer>
    </>
  )
}
