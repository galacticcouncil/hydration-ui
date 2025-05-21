import { DataTable } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { useMyRecentActivityColumns } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { useMyRecentActivityData } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.data"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MyRecentActivity: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [page, setPage] = useState(1)
  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isPending } = useMyRecentActivityData(
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )

  return (
    <DataTable
      columns={columns}
      data={swaps}
      isLoading={isPending}
      paginated
      pageSize={PAGE_SIZE}
      rowCount={totalCount}
      onPageClick={setPage}
      getExternalLink={(swap) => swap.link ?? undefined}
      emptyState={<OrdersEmptyState />}
    />
  )
}
