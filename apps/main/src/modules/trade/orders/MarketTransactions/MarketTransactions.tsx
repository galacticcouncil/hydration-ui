import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { SwapData, useSwapsData } from "@/modules/trade/orders/lib/useSwapsData"
import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MarketTransactions: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<SwapData | null>(null)

  const [page, setPage] = useState(1)
  const { swaps, totalCount, isLoading } = useSwapsData(
    true,
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )
  const columns = useMarketTransactionsColumns()

  return (
    <>
      <DataTable
        columns={columns}
        data={swaps}
        isLoading={isLoading}
        paginated
        pageSize={PAGE_SIZE}
        rowCount={totalCount}
        onPageClick={setPage}
        onRowClick={setIsDetailOpen}
        emptyState={<OrdersEmptyState />}
      />
      <Modal open={!!isDetailOpen} onOpenChange={() => setIsDetailOpen(null)}>
        {isDetailOpen && <SwapDetailsModal details={isDetailOpen} />}
      </Modal>
    </>
  )
}
