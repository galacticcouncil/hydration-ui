import { useApiPromise } from "utils/api"
import { isApiLoaded } from "utils/helpers"
import { RecentTradesTable } from "./RecentTradesTable"
import { useRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import { RecentTradesTableSkeleton } from "./skeleton/RecentTradesTableSkeleton"

export const RecentTradesTableWrapper = ({ assetId }: { assetId?: string }) => {
  const api = useApiPromise()

  if (!isApiLoaded(api)) return <RecentTradesTableSkeleton />

  return <RecentTradesTableWrapperData assetId={assetId} />
}

export const RecentTradesTableWrapperData = ({
  assetId,
}: {
  assetId?: string
}) => {
  const recentTrades = useRecentTradesTableData(assetId)

  if (recentTrades.isLoading && !recentTrades.data.length)
    return <RecentTradesTableSkeleton />

  return <RecentTradesTable data={recentTrades.data} />
}
