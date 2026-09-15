import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useMemo, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  DcaOrderData,
  isDcaScheduleOrder,
  isIntentOrder,
  OrderData,
  orderKey,
  OrderKind,
} from "@/modules/trade/orders/lib/orderData"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"
import { LimitOrderDetailsModal } from "@/modules/trade/orders/LimitOrderDetailsModal"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { useDcaEnrichment } from "@/modules/trade/orders/TradeOrders/lib/useDcaEnrichment"
import { useIntentEnrichment } from "@/modules/trade/orders/TradeOrders/lib/useIntentEnrichment"
import { PastExecutions } from "@/modules/trade/orders/TradeOrders/PastExecutions"
import { PastExecutionsIntent } from "@/modules/trade/orders/TradeOrders/PastExecutionsIntent"
import { useNeckworkTradeQueriesEnabled } from "@/modules/trade/swap/tradeDataSource"

type Props = {
  readonly paginationProps: PaginationProps
  readonly orders: Array<OrderData>
  readonly isLoading: boolean
}

export const OpenOrders: FC<Props> = ({
  paginationProps,
  orders,
  isLoading: isOrdersLoading,
}) => {
  const [detailKey, setDetailKey] = useState<string | null>(null)
  const [terminating, setTerminating] = useState<DcaOrderData | null>(null)
  const removeIntent = useRemoveIntent()

  const neckworkEnabled = useNeckworkTradeQueriesEnabled()

  // Both halves come from the container, so the asset filter it applies reaches
  // intents too. A merged row would answer yes to both guards, so schedules win
  // the tie — they cannot occur on this path today (see wayfinder ticket 08),
  // but the ordering is the module's documented rule.
  const scheduleOrders = useMemo(
    () => orders.filter(isDcaScheduleOrder),
    [orders],
  )
  const intentOrders = useMemo(
    () =>
      orders.filter(
        (order) => !isDcaScheduleOrder(order) && isIntentOrder(order),
      ),
    [orders],
  )
  const { orders: enrichedOrders, refetch } = useDcaEnrichment(scheduleOrders)
  const { orders: enrichedIntents, refetch: refetchIntents } =
    useIntentEnrichment(intentOrders)

  const allOrders = useMemo<Array<OrderData>>(
    () => [...enrichedIntents, ...enrichedOrders],
    [enrichedIntents, enrichedOrders],
  )

  const columns = useOpenOrdersColumns()

  const detail = allOrders.find((order) => orderKey(order) === detailKey)

  const close = () => {
    setDetailKey(null)
    setTerminating(null)
  }

  const isLoading = isOrdersLoading

  return (
    <>
      <DataTable
        data={allOrders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        onRowClick={(order) => {
          if (neckworkEnabled) {
            void refetch()
            void refetchIntents()
          }
          setDetailKey(orderKey(order))
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
          detail &&
          (detail.kind === OrderKind.Limit ? (
            <LimitOrderDetailsModal
              details={detail}
              onCancel={close}
              pastExecutions={
                // An all-or-nothing intent resolves whole or not at all, so
                // there are no parts to list.
                detail.isPartiallyFillable ? (
                  <PastExecutionsIntent intentId={detail.intentId} />
                ) : undefined
              }
            />
          ) : (
            <DcaOrderDetailsModal
              details={detail}
              pastExecutions={
                isDcaScheduleOrder(detail) ? (
                  <PastExecutions scheduleId={detail.scheduleId} />
                ) : (
                  <PastExecutionsIntent intentId={detail.intentId} />
                )
              }
              onTerminate={() => {
                if (isDcaScheduleOrder(detail)) {
                  setTerminating(detail)
                  return
                }

                removeIntent.mutate(detail.intentId, { onSuccess: close })
              }}
            />
          ))
        )}
      </Modal>
    </>
  )
}
