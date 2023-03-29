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
import { Fragment, useMemo, useState } from "react"
import { useMedia } from "react-use"

import { theme } from "theme"
import { FillOrder } from "../modals/FillOrder"
import { PartialFillOrder } from "../modals/PartialFillOrder"
import { CancelOrder } from "../modals/CancelOrder"
import { ordersTableStyles } from "./OtcOrders.styled"
import { useOrdersTable } from "./OtcOrders.utils"
import { OrderTableData } from "./OtcOrdersData.utils"
import { OtcOrderActionsMob } from "./actions/OtcOrderActionsMob"
import { safeConvertAddressSS58 } from "utils/formatting"
import { useAccountStore } from "state/store"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

type Props = {
  data: OrderTableData[]
  showMyOrders: boolean
  showPartial: boolean
}

export const OtcOrderTable = ({ data, showMyOrders, showPartial }: Props) => {
  const [row, setRow] = useState<OrderTableData | undefined>(undefined)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [fillOrder, setFillOrder] = useState<OrderTableData | undefined>(
    undefined,
  )
  const [closeOrder, setCloseOrder] = useState<OrderTableData | undefined>(
    undefined,
  )

  const { account } = useAccountStore()
  const userAddress = safeConvertAddressSS58(
    account?.address,
    HYDRA_ADDRESS_PREFIX,
  )

  const filteredData = useMemo(() => {
    let res: OrderTableData[] = data

    if (showPartial) {
      res = res.filter((o) => o.partiallyFillable)
    }
    if (showMyOrders) {
      res = res.filter((o) => o.owner === userAddress)
    }
    return res.sort((a, b) => Number(b.pol) - Number(a.pol))
  }, [data, userAddress, showMyOrders, showPartial])

  const table = useOrdersTable(filteredData, {
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
