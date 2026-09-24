import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { RoutedTradeData } from "@/modules/trade/orders/lib/types"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"
import { useRoutedTradesData } from "@/modules/trade/orders/TradeOrders/lib/useRoutedTradesData"
import { useMyRecentActivityColumns } from "@/modules/trade/orders/TradeOrders/MyRecentActivity.columns"

type Props = {
  readonly paginationProps: PaginationProps
  readonly assetIds: Array<string>
}

export const MyRecentActivity: FC<Props> = ({ paginationProps, assetIds }) => {
  const [isDetailOpen, setIsDetailOpen] = useState<RoutedTradeData | null>(null)

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isLoading } = useRoutedTradesData(
    address,
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
