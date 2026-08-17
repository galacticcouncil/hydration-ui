import { DCA_OPEN_STATUSES } from "@galacticcouncil/indexer/neckwork"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import { OrderData } from "@/modules/trade/orders/lib/useOrdersData"
import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"
import { useNeckworkOrdersData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkOrdersData"
import { PastExecutionsNeckwork } from "@/modules/trade/orders/TradeOrdersNeckwork/PastExecutionsNeckwork"

type Props = {
  readonly paginationProps: PaginationProps
}

export const OpenOrdersNeckwork: FC<Props> = ({ paginationProps }) => {
  const [isDetailOpen, setIsDetailOpen] = useState<{
    readonly detail: OrderData
    readonly isTermination: boolean
  } | null>(null)

  const { orders, totalCount, isLoading } = useNeckworkOrdersData(
    DCA_OPEN_STATUSES,
    [],
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  const columns = useOpenOrdersColumns()

  return (
    <>
      <DataTable
        data={orders}
        columns={columns}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount}
        onRowClick={(detail) =>
          setIsDetailOpen({ detail, isTermination: false })
        }
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen?.isTermination === false && (
          <DcaOrderDetailsModal
            details={isDetailOpen.detail}
            pastExecutions={
              <PastExecutionsNeckwork
                scheduleId={isDetailOpen.detail.scheduleId}
              />
            }
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
