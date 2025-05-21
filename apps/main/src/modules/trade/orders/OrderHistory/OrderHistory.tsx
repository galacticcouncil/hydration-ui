import { DataTable } from "@galacticcouncil/ui/components"

import { useOrderHistoryColumns } from "@/modules/trade/orders/OrderHistory/OrderHistory.columns"
import { useOrderHistoryData } from "@/modules/trade/orders/OrderHistory/OrderHistory.data"

export const OrderHistory = () => {
  const { orders, isLoading } = useOrderHistoryData()
  const columns = useOrderHistoryColumns()

  return <DataTable data={orders} columns={columns} isLoading={isLoading} />
}
