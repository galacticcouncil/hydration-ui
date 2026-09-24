import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { OrderData } from "@/modules/trade/orders/lib/types"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { useDcaEnrichment } from "@/modules/trade/orders/TradeOrders/lib/useDcaEnrichment"
import { PastExecutions } from "@/modules/trade/orders/TradeOrders/PastExecutions"

type Props = {
  readonly paginationProps: PaginationProps
  readonly orders: Array<OrderData>
  readonly isLoading: boolean
}

export const OpenOrders: FC<Props> = ({
  paginationProps,
  orders,
  isLoading,
}) => {
  const [detailId, setDetailId] = useState<number | null>(null)
  const [terminating, setTerminating] = useState<OrderData | null>(null)

  const { orders: enrichedOrders, refetch } = useDcaEnrichment(orders)

  const columns = useOpenOrdersColumns()

  const detail = enrichedOrders.find(
    ({ scheduleId }) => scheduleId === detailId,
  )

  const close = () => {
    setDetailId(null)
    setTerminating(null)
  }

  return (
    <>
      <DataTable
        data={enrichedOrders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        onRowClick={({ scheduleId }) => {
          void refetch()
          setDetailId(scheduleId)
        }}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!detail || !!terminating} onOpenChange={close}>
        {terminating ? (
          <TerminateDcaScheduleModalContent
            scheduleId={terminating.scheduleId}
            sold={terminating.fromAmountExecuted}
            total={terminating.fromAmountBudget}
            symbol={terminating.from.symbol}
            openBudget={terminating.isOpenBudget}
            onClose={() => setTerminating(null)}
          />
        ) : (
          detail && (
            <DcaOrderDetailsModal
              details={detail}
              pastExecutions={<PastExecutions scheduleId={detail.scheduleId} />}
              onTerminate={() => setTerminating(detail)}
            />
          )
        )}
      </Modal>
    </>
  )
}
