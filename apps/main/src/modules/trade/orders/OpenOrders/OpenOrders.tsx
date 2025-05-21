import { DataTable } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { DcaScheduleStatus } from "@/api/graphql/trade-orders"
import { useOrdersData } from "@/modules/trade/orders/lib/useOrdersData"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const OpenOrders: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [page, setPage] = useState(1)
  const { orders, totalCount, isLoading } = useOrdersData(
    [DcaScheduleStatus.Created],
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )
  const columns = useOpenOrdersColumns()

  return (
    <DataTable
      data={orders}
      columns={columns}
      isLoading={isLoading}
      paginated
      pageSize={PAGE_SIZE}
      rowCount={totalCount}
      onPageClick={setPage}
      emptyState={<OrdersEmptyState />}
    />
  )
}
