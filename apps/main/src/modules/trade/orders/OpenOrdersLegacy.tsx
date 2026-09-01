import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { useDcaGrafanaEnrichment } from "@/modules/trade/orders/lib/useDcaGrafanaEnrichment"
import { useIntentOrdersData } from "@/modules/trade/orders/lib/useIntentOrdersData"
import {
  DcaOrderData,
  isDcaScheduleOrder,
  OrderData,
  orderKey,
  OrderKind,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useRemoveIntent } from "@/modules/trade/orders/lib/useRemoveIntent"
import { LimitOrderDetailsModal } from "@/modules/trade/orders/LimitOrderDetailsModal"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { PastExecutionsLegacy } from "@/modules/trade/orders/PastExecutions/PastExecutionsLegacy"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { useChainOrdersData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useChainOrdersData"

type Props = {
  readonly paginationProps: PaginationProps
}

export const OpenOrdersLegacy: FC<Props> = ({ paginationProps }) => {
  const { allPairs, assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [detailKey, setDetailKey] = useState<string | null>(null)
  const [terminating, setTerminating] = useState<DcaOrderData | null>(null)
  const removeIntent = useRemoveIntent()

  const assetFilter = allPairs ? [] : [assetIn, assetOut]

  // same shape as the neckwork tab: DCA schedules come from chain state and are
  // topped up with filled amounts (grafana here, the neckwork indexer there),
  // intents are chain-only
  const { orders: chainOrders, isLoading: isChainLoading } =
    useChainOrdersData()
  const { orders: enrichedOrders, refetch } =
    useDcaGrafanaEnrichment(chainOrders)
  const { orders: intentOrders, isLoading: isIntentsLoading } =
    useIntentOrdersData(assetFilter)

  const allOrders = useMemo<Array<OrderData>>(
    () => [...intentOrders, ...enrichedOrders],
    [intentOrders, enrichedOrders],
  )

  const columns = useOpenOrdersColumns()

  const detail = allOrders.find((order) => orderKey(order) === detailKey)

  const close = () => {
    setDetailKey(null)
    setTerminating(null)
  }

  return (
    <>
      <DataTable
        data={allOrders}
        columns={columns}
        isLoading={isChainLoading && isIntentsLoading}
        paginated
        {...paginationProps}
        onRowClick={(order) => {
          void refetch()
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
            <LimitOrderDetailsModal details={detail} onCancel={close} />
          ) : (
            <DcaOrderDetailsModal
              details={detail}
              pastExecutions={
                isDcaScheduleOrder(detail) ? (
                  <PastExecutionsLegacy
                    scheduleId={detail.scheduleId}
                    assetIn={detail.from}
                    assetOut={detail.to}
                  />
                ) : null
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
