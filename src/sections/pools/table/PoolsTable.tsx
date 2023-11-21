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
import { useOmnipoolPoolTable } from "./PoolsTable.utils"
import { TPool } from "sections/pools/PoolsPage.utils"
import { useNavigate } from "@tanstack/react-location"
import { AddLiquidity } from "sections/pools/modals/AddLiquidity/AddLiquidity"
import { useState } from "react"
import { assetsTableStyles } from "sections/wallet/assets/table/WalletAssetsTable.styled"

export const PoolsTable = ({ data }: { data: TPool[] }) => {
  const [addLiquidityPool, setAddLiquidityPool] = useState<TPool | undefined>(
    undefined,
  )

  const navigate = useNavigate()

  const onRowSelect = (id: string) =>
    navigate({
      search: { id },
    })

  const table = useOmnipoolPoolTable(data, setAddLiquidityPool)

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
                onClick={() => onRowSelect(row.original.assetId)}
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
