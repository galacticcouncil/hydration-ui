import { DataTable } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"

import { useMyRecentActivityColumns } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.columns"
import { useMyRecentActivityData } from "@/modules/trade/orders/MyRecentActivity/MyRecentActivity.data"

const PAGE_SIZE = 10

export const MyRecentActivity: FC = () => {
  const [page, setPage] = useState(1)
  const columns = useMyRecentActivityColumns()
  const { swaps, totalCount, isLoading } = useMyRecentActivityData(
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
    />
  )
}
