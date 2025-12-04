import { DataTable, Modal } from "@galacticcouncil/ui/components"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import {
  RoutedTradeData,
  useRoutedTradesData,
} from "@/modules/trade/orders/lib/useRoutedTradesData"
import { useMyRecentActivityColumns } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"
import { SwapDetailsModal } from "@/modules/trade/orders/SwapDetailsModal"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MyRecentActivity: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [isDetailOpen, setIsDetailOpen] = useState<RoutedTradeData | null>(null)

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const [page, setPage] = useState(1)
  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isLoading } = useRoutedTradesData(
    address,
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )

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
