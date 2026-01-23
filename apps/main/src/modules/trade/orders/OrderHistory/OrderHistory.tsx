import { DcaScheduleStatus } from "@galacticcouncil/indexer/squid"
import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { DcaOrderDetailsModal } from "@/modules/trade/orders/DcaOrderDetailsModal"
import {
  OrderData,
  useOrdersData,
} from "@/modules/trade/orders/lib/useOrdersData"
import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { TerminateDcaScheduleModalContent } from "@/modules/trade/orders/TerminateDcaScheduleModalContent"

type Props = {
  readonly allPairs: boolean
  readonly paginationProps: PaginationProps
}

export const OrderHistory: FC<Props> = ({ allPairs, paginationProps }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<{
    readonly detail: OrderData
    readonly isTermination: boolean
  } | null>(null)

  const { orders, totalCount, isLoading } = useOrdersData(
    [DcaScheduleStatus.Completed, DcaScheduleStatus.Terminated],
    allPairs ? [] : [assetIn, assetOut],
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  const columns = useOrderHistoryColumns()

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
