import { DataTable } from "@galacticcouncil/ui/components"
import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { useSwapsData } from "@/modules/trade/orders/lib/useSwapsData"
import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.columns"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MarketTransactions: FC<Props> = ({ allPairs }) => {
  const { isMobile } = useBreakpoints()
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [page, setPage] = useState(1)
  const { swaps, totalCount, isLoading } = useSwapsData(
    true,
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )
  const columns = useMarketTransactionsColumns()

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
