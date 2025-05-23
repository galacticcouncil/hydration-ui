import { DataTable } from "@galacticcouncil/ui/components"

import { useMarketTransactionsColumns } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.column"
import { useMarketTransactionsData } from "@/modules/trade/orders/MarketTransactions/MarketTransactions.data"

export const MarketTransactions = () => {
  const { transactions, isLoading } = useMarketTransactionsData()
  const columns = useMarketTransactionsColumns()

  return (
    <DataTable data={transactions} columns={columns} isLoading={isLoading} />
  )
}
