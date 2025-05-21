import { DataTable } from "@galacticcouncil/ui/components"
import { useSearch } from "@tanstack/react-router"
import { FC, useState } from "react"

import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.column"
import { useMarketTransactionsData } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.data"
import { OrdersEmptyState } from "@/modules/trade/orders/OrdersEmptyState"

const PAGE_SIZE = 10

type Props = {
  readonly allPairs: boolean
}

export const MarketTransactions: FC<Props> = ({ allPairs }) => {
  const { assetIn, assetOut } = useSearch({
    from: "/trade/_history",
  })

  const [page, setPage] = useState(1)
  const { transactions, totalCount, isPending } = useMarketTransactionsData(
    allPairs ? [] : [assetIn, assetOut],
    page,
    PAGE_SIZE,
  )
  const columns = useMarketTransactionsColumns()

  return (
    <DataTable
      columns={columns}
      data={transactions}
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
