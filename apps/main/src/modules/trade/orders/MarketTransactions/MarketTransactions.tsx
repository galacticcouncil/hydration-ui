import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { SwapData, useSwapsData } from "@/modules/trade/orders/lib/useSwapsData"
import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"

type Props = {
  readonly allPairs: boolean
  readonly paginationProps: PaginationProps
}

export const MarketTransactions: FC<Props> = ({
  allPairs,
  paginationProps,
}) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<SwapData | null>(null)

  const { swaps, totalCount, isLoading } = useSwapsData(
    true,
    allPairs ? [] : [assetIn, assetOut],
    paginationProps.pagination.pageIndex,
    paginationProps.pagination.pageSize,
  )
  const columns = useMarketTransactionsColumns()

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
