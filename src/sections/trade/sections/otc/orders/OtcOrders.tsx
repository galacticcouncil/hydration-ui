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
import { Text } from "components/Typography/Text/Text"
import { Fragment, useCallback, useMemo, useState } from "react"
import { useMedia } from "react-use"
import { theme } from "theme"
import { FillOrder } from "sections/trade/sections/otc/modals/FillOrder"
import { PartialFillOrder } from "sections/trade/sections/otc/modals/PartialFillOrder"
import { CancelOrder } from "sections/trade/sections/otc/modals/CancelOrder"
import { ordersTableStyles } from "./OtcOrders.styled"
import { useOrdersTable } from "./OtcOrders.utils"
import { OrderTableData } from "./OtcOrdersData.utils"
import { OtcOrderActionsMob } from "./actions/OtcOrderActionsMob"
import { safeConvertAddressSS58 } from "utils/formatting"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { useTranslation } from "react-i18next"
import { EmptyState } from "components/Table/EmptyState"

type Props = {
  data: OrderTableData[]
  showMyOrders: boolean
  showPartial: boolean
  searchVal: string
}

export const OtcOrderTable = ({
  data,
  showMyOrders,
  showPartial,
  searchVal,
}: Props) => {
  const { t } = useTranslation()
  const [row, setRow] = useState<OrderTableData | undefined>(undefined)
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const [fillOrder, setFillOrder] = useState<OrderTableData | undefined>(
    undefined,
  )
  const [closeOrder, setCloseOrder] = useState<OrderTableData | undefined>(
    undefined,
  )

  const { account } = useAccount()
  const userAddress = safeConvertAddressSS58(account?.address)

  const filteredData = useMemo(() => {
    let res: OrderTableData[] = data

    if (showPartial) {
      res = res.filter((o) => o.partiallyFillable)
    }
    if (showMyOrders) {
      res = res.filter((o) => o.owner === userAddress)
    }

    if (searchVal) {
      const lowercasedSearchVal = searchVal.toLowerCase()
      res = res.filter(
        (o) =>
          o.accepting.name.toLowerCase().includes(lowercasedSearchVal) ||
          o.accepting.symbol.toLowerCase().includes(lowercasedSearchVal) ||
          o.offer.name.toLowerCase().includes(lowercasedSearchVal) ||
          o.offer.symbol.toLowerCase().includes(lowercasedSearchVal),
      )
    }

    return res.sort((a, b) => Number(b.pol) - Number(a.pol))
  }, [data, userAddress, showMyOrders, showPartial, searchVal])

  const handleFillOrder = useCallback((order: OrderTableData) => {
    setFillOrder(order)
  }, [])

  const handleCloseOrder = useCallback((order: OrderTableData) => {
    setCloseOrder(order)
  }, [])

  const table = useOrdersTable(filteredData, {
    onFill: handleFillOrder,
    onClose: handleCloseOrder,
  })

  return (
    <TableContainer css={ordersTableStyles}>
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
          {table.getRowModel().rows.length > 0 ? (
            table.getRowModel().rows.map((row, i) => (
              <Fragment key={row.id}>
                <TableRow
                  onClick={() => {
                    isDesktop && row.toggleSelected()
                    !isDesktop && setRow(row.original)
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableData key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableData>
                  ))}
                </TableRow>
              </Fragment>
            ))
          ) : showMyOrders ? (
            <EmptyState
              colSpan={10}
              desc={
                <Text
                  fs={14}
                  color="basic700"
                  tAlign="center"
                  sx={{ maxWidth: 290, mb: 10 }}
                >
                  {t("otc.orders.noOrders")}
                </Text>
              }
            />
          ) : null}
        </TableBodyContent>
      </Table>
      {fillOrder && fillOrder.partiallyFillable && (
        <PartialFillOrder
          orderId={fillOrder.id}
          accepting={fillOrder.accepting}
          offering={fillOrder.offer}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {fillOrder && !fillOrder.partiallyFillable && (
        <FillOrder
          orderId={fillOrder.id}
          accepting={fillOrder.accepting}
          offering={fillOrder.offer}
          onClose={() => setFillOrder(undefined)}
          onSuccess={() => {}}
        />
      )}
      {closeOrder && (
        <CancelOrder
          orderId={closeOrder.id}
          offering={closeOrder.offer}
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
