import { DCA_HISTORY_STATUSES } from "@galacticcouncil/indexer/neckwork"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  DcaOrderData,
  isDcaScheduleOrder,
  OrderData,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { useNeckworkHistoryData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkHistoryData"
import { PastExecutionsNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/PastExecutionsNeckwork"

type Props = {
  readonly paginationProps: PaginationProps
}

export const OrderHistoryNeckwork: FC<Props> = ({ paginationProps }) => {
  const [isDetailOpen, setIsDetailOpen] = useState<DcaOrderData | null>(null)

  const { orders, totalCount, isLoading } = useNeckworkHistoryData(
    DCA_HISTORY_STATUSES,
    [],
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  const columns = useOrderHistoryColumns()

  return (
    <>
      <DataTable<OrderData>
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount}
        onRowClick={(order) =>
          isDcaScheduleOrder(order) && setIsDetailOpen(order)
        }
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen && (
          <DcaOrderDetailsModal
            details={isDetailOpen}
            onTerminate={null}
            pastExecutions={
              <PastExecutionsNeckwork scheduleId={isDetailOpen.scheduleId} />
            }
          />
        )}
      </Modal>
    </>
  )
}
