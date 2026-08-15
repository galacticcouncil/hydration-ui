//import { Grid } from "@galacticcouncil/ui/components"

import { FeesAndRevenue } from "@/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue"
import { FeesAndRevenueNeckwork } from "@/modules/stats/fees/FeeAndRevenueChartNeckwork/FeesAndRevenueNeckwork"
import { useNeckworkEnabled } from "@/states/neckwork"

export const StatsFees = () => {
  const isNeckworkEnabled = useNeckworkEnabled()

  return isNeckworkEnabled ? <FeesAndRevenueNeckwork /> : <FeesAndRevenue />
}
