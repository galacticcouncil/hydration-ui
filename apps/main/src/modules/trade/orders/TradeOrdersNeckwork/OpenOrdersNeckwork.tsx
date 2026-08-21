import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { useChainOrdersData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"
import { useDcaEnrichment } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useDcaEnrichment"
import { PastExecutionsNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/PastExecutionsNeckwork"

type Props = {
  readonly paginationProps: PaginationProps
}

export const OpenOrdersNeckwork: FC<Props> = ({ paginationProps }) => {
  const [detailId, setDetailId] = useState<number | null>(null)
  const [terminating, setTerminating] = useState<OrderData | null>(null)

  const { orders, isLoading } = useChainOrdersData()
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
              pastExecutions={
                <PastExecutionsNeckwork scheduleId={detail.scheduleId} />
              }
              onTerminate={() => setTerminating(detail)}
            />
          )
        )}
      </Modal>
    </>
  )
}
