import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { RecentTradesTable } from "./RecentTradesTable"
import { useRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import { RecentTradesTableSkeleton } from "./skeleton/RecentTradesTableSkeleton"

export const RecentTradesTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <RecentTradesTableSkeleton />

  return <RecentTradesTableWrapperData />
}

export const RecentTradesTableWrapperData = () => {
  const recentTrades = useRecentTradesTableData()

  if (recentTrades.isLoading && !recentTrades.data.length)
    return <RecentTradesTableSkeleton />

  return <RecentTradesTable data={recentTrades.data} />
}
