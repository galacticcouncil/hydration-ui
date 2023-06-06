import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { RecentTradesTable } from "./RecentTradesTable"
import { useRecentTradesTableData } from "./data/RecentTradesTableData.utils"

export const RecentTradesTableWrapper = () => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return null

  return <RecentTradesTableWrapperData />
}

export const RecentTradesTableWrapperData = () => {
  const recentTrades = useRecentTradesTableData()

  if (recentTrades.isLoading && !recentTrades.data.length) return null

  return <RecentTradesTable data={recentTrades.data} />
}
