//import { Grid } from "@galacticcouncil/ui/components"

import { FeesAndRevenue } from "@/modules/stats/fees/FeeAndRevenueChart/FeesAndRevenue"
//import { FeeFlowChart } from "@/modules/stats/fees/FeeFlowChart/FeeFlowChart"

export const StatsFees = () => {
  return <FeesAndRevenue />

  // return (
  //   <Grid
  //     columnTemplate={[
  //       "1fr",
  //       "1fr",
  //       "1fr",
  //       "minmax(0, 1fr) clamp(320px, 38vw, 520px)",
  //     ]}
  //     gap="xl"
  //     width="100%"
  //   >
  //     <FeesAndRevenue />
  //     <FeeFlowChart />
  //   </Grid>
  // )
}
