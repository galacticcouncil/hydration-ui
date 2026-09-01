import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { DcaOrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { useTradeOrdersHistoryData } from "@/modules/trade/orders/lib/useTradeOrdersHistoryData"
import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { PastExecutionsLegacy } from "@/modules/trade/orders/PastExecutions/PastExecutionsLegacy"

type Props = {
  readonly paginationProps: PaginationProps
}

export const OrderHistoryLegacy: FC<Props> = ({ paginationProps }) => {
  const [detail, setDetail] = useState<DcaOrderData | null>(null)

  const { orders, isLoading } = useTradeOrdersHistoryData()
  const columns = useOrderHistoryColumns()

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        onRowClick={setDetail}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!detail} onOpenChange={() => setDetail(null)}>
        {detail && (
          <DcaOrderDetailsModal
            details={detail}
            onTerminate={null}
            pastExecutions={
              <PastExecutionsLegacy
                scheduleId={detail.scheduleId}
                assetIn={detail.from}
                assetOut={detail.to}
              />
            }
          />
        )}
      </Modal>
    </>
  )
}
