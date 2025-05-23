import { DataTable } from "@galacticcouncil/ui/components"

import { useOpenOrdersColumns } from "@/modules/trade/orders/OpenOrders/OpenOrders.columns"

import { useOpenOrdersData } from "./OpenOrders.data"

export const OpenOrders = () => {
  const { orders, isLoading } = useOpenOrdersData()
  const columns = useOpenOrdersColumns()

  return (
    <DataTable
      data={orders}
      columns={columns}
      isLoading={isLoading}
      pageSize={10}
    />
  )
}
