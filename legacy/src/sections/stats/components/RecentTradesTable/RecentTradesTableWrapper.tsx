import { RecentTradesTable } from "./RecentTradesTable"
import { useRecentTradesTableData } from "./data/RecentTradesTableData.utils"
import { RecentTradesTableSkeleton } from "./skeleton/RecentTradesTableSkeleton"
import { useRpcProvider } from "providers/rpcProvider"

export const RecentTradesTableWrapper = ({ assetId }: { assetId?: string }) => {
  const { isLoaded } = useRpcProvider()

  if (!isLoaded) return <RecentTradesTableSkeleton />

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
