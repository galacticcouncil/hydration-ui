import { DataTable } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { safeConvertSS58toPublicKey } from "@galacticcouncil/utils"
import { useAccount } from "@galacticcouncil/web3-connect"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { useSwapsData } from "@/modules/trade/orders/lib/useSwapsData"
import { useMyRecentActivityColumns } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MyRecentActivity: FC<Props> = ({ allPairs }) => {
  const { isMobile } = useBreakpoints()
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const { account } = useAccount()
  const accountAddress = account?.address ?? ""
  const address = safeConvertSS58toPublicKey(accountAddress)

  const [page, setPage] = useState(1)
  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isLoading } = useSwapsData(
    address,
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )

  return (
    <DataTable
      columns={columns}
      data={swaps}
      isLoading={isLoading}
      paginated
      pageSize={PAGE_SIZE}
      rowCount={totalCount}
      onPageClick={setPage}
      getExternalLink={isMobile ? undefined : (swap) => swap.link ?? undefined}
      emptyState={<OrdersEmptyState />}
    />
  )
}
