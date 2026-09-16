import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  isDcaScheduleOrder,
  OrderData,
  orderKey,
  OrderKind,
} from "@/modules/trade/orders/lib/orderData"
import { DCA_HISTORY_ORDER_STATUSES } from "@/modules/trade/orders/lib/types"
import { LimitOrderDetailsModal } from "@/modules/trade/orders/LimitOrderDetailsModal"
import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { useHistoryData } from "@/modules/trade/orders/TradeOrders/lib/useHistoryData"
import { useIntentHistoryData } from "@/modules/trade/orders/TradeOrders/lib/useIntentHistoryData"
import { PastExecutions } from "@/modules/trade/orders/TradeOrders/PastExecutions"
import { PastExecutionsIntent } from "@/modules/trade/orders/TradeOrders/PastExecutionsIntent"
import { OrderHistoryKind } from "@/modules/trade/orders/TradeOrders/TradeOrdersHeader"

type Props = {
  readonly paginationProps: PaginationProps
  readonly assetIds: Array<string>
  readonly kind: OrderHistoryKind
}

export const OrderHistory: FC<Props> = ({
  paginationProps,
  assetIds,
  kind,
}) => {
  const [detailKey, setDetailKey] = useState<string | null>(null)

  const { pageIndex, pageSize } = paginationProps.pagination

  // One source at a time — the toggle picks which. Both hooks are called
  // (rules-of-hooks), but only the selected one is enabled, so only one fetches.
  const showIntents = kind === "intents"
  const schedules = useHistoryData(
    DCA_HISTORY_ORDER_STATUSES,
    assetIds,
    pageIndex,
    pageSize,
    !showIntents,
  )
  const intents = useIntentHistoryData(
    assetIds,
    pageIndex,
    pageSize,
    showIntents,
  )

  const { orders, totalCount, isLoading } = showIntents ? intents : schedules

  const columns = useOrderHistoryColumns()

  const detail = orders.find((order) => orderKey(order) === detailKey)
  const close = () => setDetailKey(null)

  return (
    <>
      <DataTable<OrderData>
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount}
        onRowClick={(order) => setDetailKey(orderKey(order))}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!detail} onOpenChange={close}>
        {detail &&
          (detail.kind === OrderKind.Limit ? (
            <LimitOrderDetailsModal
              details={detail}
              onCancel={close}
              pastExecutions={
                detail.isPartiallyFillable ? (
                  <PastExecutionsIntent intentId={detail.intentId} />
                ) : undefined
              }
            />
          ) : (
            <DcaOrderDetailsModal
              details={detail}
              onTerminate={null}
              pastExecutions={
                isDcaScheduleOrder(detail) ? (
                  <PastExecutions scheduleId={detail.scheduleId} />
                ) : (
                  <PastExecutionsIntent intentId={detail.intentId} />
                )
              }
            />
          ))}
      </Modal>
    </>
  )
}
