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
import { useNavigate } from "@tanstack/react-location"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"

export const PoolsTable = ({
  data,
  isXyk = false,
}: {
  data: TPool[] | TXYKPool[]
  isXyk?: boolean
}) => {
  const navigate = useNavigate()

  const onRowSelect = (id: string) =>
    navigate({
      search: { id },
    })

  const table = usePoolTable(data, isXyk)

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
                isOdd={!(i % 2)}
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
      </TableContainer>
    </>
  )
}
