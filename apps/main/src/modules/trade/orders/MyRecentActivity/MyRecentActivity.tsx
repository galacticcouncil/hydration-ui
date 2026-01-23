import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import {
  RoutedTradeData,
  useRoutedTradesData,
} from "@/modules/trade/orders/lib/useRoutedTradesData"
import { useMyRecentActivityColumns } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"

type Props = {
  readonly allPairs: boolean
  readonly paginationProps: PaginationProps
}

export const MyRecentActivity: FC<Props> = ({ allPairs, paginationProps }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<RoutedTradeData | null>(null)

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isLoading } = useRoutedTradesData(
    address,
    allPairs ? [] : [assetIn, assetOut],
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
