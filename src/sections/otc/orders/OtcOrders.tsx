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
import { Fragment, useState } from "react"
import { useMedia } from "react-use"

import { theme } from "theme"
import { FillOrder } from "../modals/FillOrder"
import { PartialFillOrder } from "../modals/PartialFillOrder"
import { CancelOrder } from "../modals/CancelOrder"
import { ordersTableStyles } from "./OtcOrders.styled"
import { useOrdersTable } from "./OtcOrders.utils"
import { OrderTableData } from "./OtcOrdersData.utils"
import { OtcOrderActionsMob } from "./actions/OtcOrderActionsMob"

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

  const table = useOrdersTable(data, {
    onFill: setFillOrder,
    onClose: setCloseOrder,
  })

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
                  <TableData key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableData>
                ))}
              </TableRow>
            </Fragment>
          ))}
        </TableBodyContent>
      </Table>
      {fillOrder && fillOrder.partiallyFillable && (
        <PartialFillOrder
          orderId={fillOrder.id}
          accepting={fillOrder.accepting}
          offering={fillOrder.offering}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {fillOrder && !fillOrder.partiallyFillable && (
        <FillOrder
          orderId={fillOrder.id}
          accepting={fillOrder.accepting}
          offering={fillOrder.offering}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {closeOrder && (
        <CancelOrder
          orderId={closeOrder.id}
          offering={closeOrder.offering}
          onClose={() => setCloseOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {!isDesktop && (
        <OtcOrderActionsMob
          row={row}
          onClose={() => setRow(undefined)}
          onCloseOrder={setCloseOrder}
          onFillOrder={setFillOrder}
        />
      )}
    </TableContainer>
  )
}
