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
  readonly openOrdersCount?: number
}

export const OpenOrdersNeckwork: FC<Props> = ({
  paginationProps,
  openOrdersCount,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState<{
    readonly detail: OrderData
    readonly isTermination: boolean
  } | null>(null)

  const { orders, isLoading } = useChainOrdersData()
  const enrichedOrders = useDcaEnrichment(orders)

  const columns = useOpenOrdersColumns()

  return (
    <>
      <DataTable
        data={enrichedOrders}
        columns={columns}
        isLoading={isLoading}
        skeletonRowCount={openOrdersCount}
        paginated
        {...paginationProps}
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
