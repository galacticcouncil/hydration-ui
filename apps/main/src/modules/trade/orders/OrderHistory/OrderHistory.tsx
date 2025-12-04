import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  OrderData,
  useOrdersData,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const OrderHistory: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<OrderData | null>(null)

  const [page, setPage] = useState(1)
  const { orders, totalCount, isLoading } = useOrdersData(
    [DcaScheduleStatus.Completed, DcaScheduleStatus.Terminated],
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )
  const columns = useOrderHistoryColumns()

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        pageSize={PAGE_SIZE}
        rowCount={totalCount}
        onPageClick={setPage}
        onRowClick={setIsDetailOpen}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen && <DcaOrderDetailsModal details={isDetailOpen} />}
      </Modal>
    </>
  )
}
