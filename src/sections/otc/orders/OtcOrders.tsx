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
import { ordersTableStyles } from "./OtcOrders.styled"
import { useOrdersTable } from "./OtcOrders.utils"
import { OrderTableData } from "./OtcOrdersData.utils"

type Props = {
  data: OrderTableData[]
}

export const OtcOrderTable = ({ data }: Props) => {
  const [row, setRow] = useState<OrderTableData | undefined>(undefined)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [fillOrder, setFillOrder] = useState<OrderTableData | undefined>(
    undefined,
  )
  const [closeOrder, setCloseOrder] = useState<OrderTableData | undefined>(
    undefined,
  )

  // const [fillOrder, setFillOrder] = useState<string | null>(null)
  // const [closeOrder, setCloseOrder] = useState<string | null>(null)

  const table = useOrdersTable(data, {
    onFill: setFillOrder,
    onClose: setCloseOrder,
  })

  console.log(fillOrder)

  return (
    <TableContainer css={ordersTableStyles}>
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
          isOpen={true}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {closeOrder && <div></div>}
    </TableContainer>
  )
}
