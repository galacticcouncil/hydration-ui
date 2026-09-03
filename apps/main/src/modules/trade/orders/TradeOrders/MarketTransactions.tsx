import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SwapData } from "@/modules/trade/orders/lib/types"
import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"
import { useMarketTradesData } from "@/modules/trade/orders/TradeOrders/lib/useMarketTradesData"

type Props = {
  readonly paginationProps: PaginationProps
  readonly assetIds: Array<string>
}

export const MarketTransactions: FC<Props> = ({
  paginationProps,
  assetIds,
}) => {
  const [isDetailOpen, setIsDetailOpen] = useState<SwapData | null>(null)

  const columns = useMarketTransactionsColumns()
  const { swaps, totalCount, isLoading } = useMarketTradesData(
    assetIds,
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )

  return (
    <>
      <DataTable
        columns={columns}
        data={swaps}
        isLoading={isLoading}
        paginated
        {...paginationProps}
        rowCount={totalCount}
        onRowClick={setIsDetailOpen}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen && <SwapDetailsModal details={isDetailOpen} />}
      </Modal>
    </>
  )
}
