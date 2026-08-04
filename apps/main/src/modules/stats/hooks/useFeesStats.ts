import { useMemo } from "react"

import { useFeesChartsData } from "@/api/stats"

export const useFeesStats = () => {
  const { data: feesChartsData, isLoading } = useFeesChartsData({
    viewMode: "protocol",
    timeRange: "1Y",
  })

  const stats = useMemo(() => {
    const protocolRevenue = feesChartsData
      ? Object.values(feesChartsData).reduce(
          (acc, field) => acc + field.periodAggregate,
          0,
        )
      : 0

    return {
      protocolRevenue,
    }
  }, [feesChartsData])

  return {
    stats,
    isLoading,
  }
}
