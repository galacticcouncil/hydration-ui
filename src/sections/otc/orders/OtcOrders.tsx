import { flexRender } from "@tanstack/react-table"
import { TableSortHeader } from "components/Table/Table"
import {
  Table,
  TableBodyContent,
  TableContainer,
  TableDataBasic,
  TableHeaderContent,
  TableRow,
} from "components/Table/Table.styled"
import { Fragment, useState } from "react"
import { useMedia } from "react-use"

import { theme } from "theme"
import { FillOrder } from "../modals/FillOrder"
import { useOffersTable } from "./OtcOrders.utils"
import { OffersTableData } from "./OtcOrdersData.utils"

type Props = {
  data: OffersTableData[]
}

export const OtcOffersTable = ({ data }: Props) => {
  const [row, setRow] = useState<OffersTableData | undefined>(undefined)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [fillOrder, setFillOrder] = useState<OffersTableData | undefined>(
    undefined,
  )
  const [closeOrder, setCloseOrder] = useState<OffersTableData | undefined>(
    undefined,
  )

  // const [fillOrder, setFillOrder] = useState<string | null>(null)
  // const [closeOrder, setCloseOrder] = useState<string | null>(null)

  const table = useOffersTable(data, {
    onFill: setFillOrder,
    onClose: setCloseOrder,
  })

  return (
    <TableContainer>
      <Table>
        <TableHeaderContent>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((header) => (
                <TableSortHeader key={header.id} canSort={false}>
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
            <Fragment key={row.id}>
              <TableRow
                isOdd={!(i % 2)}
                onClick={() => {
                  isDesktop && row.toggleSelected()
                  !isDesktop && setRow(row.original)
                }}
              >
                {row.getVisibleCells().map((cell) => (
                  <TableDataBasic key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableDataBasic>
                ))}
              </TableRow>
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
      {fillOrder && (
        <FillOrder
          orderId={fillOrder.id}
          assetIn={fillOrder.accepting.asset}
          assetOut={fillOrder.offering.asset}
          amountIn={fillOrder.accepting.amount}
          amountOut={fillOrder.offering.amount}
          partiallyFillable={fillOrder.partiallyFillable}
          isOpen={fillOrder !== undefined}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {closeOrder && <div></div>}
    </TableContainer>
  )
}
