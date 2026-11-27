import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useMemo, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  isIntentOrder,
  OrderData,
  orderKey,
  OrderKind,
} from "@/modules/trade/orders/lib/orderData"
import { useDcaPeriodMs } from "@/modules/trade/orders/lib/useDcaPeriodMs"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"
import { LimitOrderDetailsModal } from "@/modules/trade/orders/LimitOrderDetailsModal"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { useIntentEnrichment } from "@/modules/trade/orders/TradeOrders/lib/useIntentEnrichment"
import { PastExecutionsIntent } from "@/modules/trade/orders/TradeOrders/PastExecutionsIntent"
import { useNeckworkEnabled } from "@/states/neckwork"

type Props = {
  readonly paginationProps: PaginationProps
  readonly orders: Array<OrderData>
  readonly isLoading: boolean
  readonly isError: boolean
}

export const OpenOrders: FC<Props> = ({
  paginationProps,
  orders,
  isLoading: isOrdersLoading,
  isError,
}) => {
  const [detailKey, setDetailKey] = useState<string | null>(null)
  const removeIntent = useRemoveIntent()

  const neckworkEnabled = useNeckworkEnabled()

  const intentOrders = useMemo(() => orders.filter(isIntentOrder), [orders])
  const { orders: allOrders, refetch: refetchIntents } =
    useIntentEnrichment(intentOrders)

  const columns = useOpenOrdersColumns()

  const detail = allOrders.find((order) => orderKey(order) === detailKey)
  const periodMs = useDcaPeriodMs(detail)

  const close = () => setDetailKey(null)

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
            void refetchIntents()
          }
          setDetailKey(orderKey(order))
        }}
        emptyState={<OrdersEmptyState isError={isError} />}
      />
      <Modal open={!!detail} onOpenChange={close}>
        {detail &&
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
            isIntentOrder(detail) && (
              <DcaOrderDetailsModal
                details={detail}
                pastExecutions={
                  <PastExecutionsIntent
                    intentId={detail.intentId}
                    periodMs={periodMs}
                  />
                }
                onTerminate={() =>
                  removeIntent.mutate(detail.intentId, { onSuccess: close })
                }
              />
            )
          ))}
      </Modal>
    </>
  )
}
