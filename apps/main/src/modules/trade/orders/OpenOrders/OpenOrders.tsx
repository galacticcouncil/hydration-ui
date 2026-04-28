import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useMemo, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { useIntentOrdersData } from "@/modules/trade/orders/lib/useIntentOrdersData"
import {
  OrderData,
  OrderKind,
  useOrdersData,
} from "@/modules/trade/orders/lib/useOrdersData"
import { LimitOrderDetailsModal } from "@/modules/trade/orders/LimitOrderDetailsModal"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

type Props = {
  readonly allPairs: boolean
  readonly paginationProps: PaginationProps
}

export const OpenOrders: FC<Props> = ({ allPairs, paginationProps }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<{
    readonly detail: OrderData
    readonly isTermination: boolean
  } | null>(null)

  const assetFilter = allPairs ? [] : [assetIn, assetOut]

  const {
    orders: dcaOrders,
    totalCount,
    isLoading: isDcaLoading,
  } = useOrdersData(
    [DcaScheduleStatus.Created],
    assetFilter,
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  const { orders: intentOrders, isLoading: isIntentsLoading } =
    useIntentOrdersData(assetFilter)

  const allOrders = useMemo(
    () => [...intentOrders, ...dcaOrders],
    [intentOrders, dcaOrders],
  )

  const columns = useOpenOrdersColumns()

  return (
    <>
      <DataTable
        data={allOrders}
        columns={columns}
        isLoading={isDcaLoading && isIntentsLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount + intentOrders.length}
        onRowClick={(detail) => {
          setIsDetailOpen({ detail, isTermination: false })
        }}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen && isDetailOpen.detail.kind === OrderKind.Limit && (
          <LimitOrderDetailsModal
            details={isDetailOpen.detail}
            onCancel={() => setIsDetailOpen(null)}
          />
        )}
        {isDetailOpen &&
          isDetailOpen.detail.kind !== OrderKind.Limit &&
          isDetailOpen.isTermination === false && (
            <DcaOrderDetailsModal
              details={isDetailOpen.detail}
              onTerminate={() =>
                setIsDetailOpen({
                  ...isDetailOpen,
                  isTermination: true,
                })
              }
            />
          )}
        {isDetailOpen &&
          isDetailOpen.detail.kind !== OrderKind.Limit &&
          isDetailOpen.isTermination === true && (
            <TerminateDcaScheduleModalContent
              scheduleId={isDetailOpen.detail.scheduleId}
              sold={isDetailOpen.detail.fromAmountExecuted}
              total={isDetailOpen.detail.fromAmountBudget}
              symbol={isDetailOpen.detail.from.symbol}
              openBudget={isDetailOpen.detail.isOpenBudget}
              onClose={() =>
                setIsDetailOpen({
                  detail: isDetailOpen.detail,
                  isTermination: false,
                })
              }
            />
          )}
      </Modal>
    </>
  )
}
