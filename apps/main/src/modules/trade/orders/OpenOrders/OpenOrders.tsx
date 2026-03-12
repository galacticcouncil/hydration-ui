import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  OrderData,
  OrderKind,
  useOrdersData,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useIntentsData } from "@/modules/trade/orders/lib/useIntentsData"
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

  const { orders: dcaOrders, totalCount, isLoading: isDcaLoading } = useOrdersData(
    [DcaScheduleStatus.Created],
    allPairs ? [] : [assetIn, assetOut],
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  const { orders: allIntentOrders, isLoading: isIntentsLoading } =
    useIntentsData()

  const intentOrders = allPairs
    ? allIntentOrders
    : allIntentOrders.filter(
        (o) => o.from.id === assetIn && o.to.id === assetOut,
      )

  const orders = [...intentOrders, ...dcaOrders]
  const isLoading = isDcaLoading || isIntentsLoading

  const columns = useOpenOrdersColumns()

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount + intentOrders.length}
        onRowClick={(detail) => {
          if (detail.kind !== OrderKind.Limit) {
            setIsDetailOpen({ detail, isTermination: false })
          }
        }}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen?.isTermination === false && (
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
        {isDetailOpen?.isTermination === true && (
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
