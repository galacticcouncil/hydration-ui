import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { FC, useState } from "react"

import { PaginationProps } from "@/hooks/useDataTableUrlPagination"
import { RoutedTradeData } from "@/modules/trade/orders/lib/useRoutedTradesData"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"
import { useNeckworkRoutedTradesData } from "@/modules/trade/orders/TradeOrdersNeckwork/lib/useNeckworkRoutedTradesData"
import { useMyRecentActivityNeckworkColumns } from "@/modules/trade/orders/TradeOrdersNeckwork/MyRecentActivityNeckwork.columns"

type Props = {
  readonly paginationProps: PaginationProps
}

export const MyRecentActivityNeckwork: FC<Props> = ({ paginationProps }) => {
  const [isDetailOpen, setIsDetailOpen] = useState<RoutedTradeData | null>(null)

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const columns = useMyRecentActivityNeckworkColumns()
  const { swaps, totalCount, isLoading } = useNeckworkRoutedTradesData(
    address,
    [],
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
