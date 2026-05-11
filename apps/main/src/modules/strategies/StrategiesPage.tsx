import { Grid, SectionHeader } from "@galacticcouncil/ui/components"

import { LINKS } from "@/config/navigation"
import { StrategyCard } from "@/modules/strategies/components/StrategyCard/StrategyCard"

export const StrategiesPage = () => {
  return (
    <>
      <SectionHeader title="Strategies" noTopPadding />
      <Grid columnTemplate="repeat(4, 1fr)">
        <StrategyCard
          logoId="decentral"
          title="Decentral"
          apy={4.5}
          description="Lorem ipsum dolor sit amet consectetur adipisicing elit. Quisquam, quos."
          link={LINKS.strategiesHdcl}
        />
      </Grid>
    </>
  )
}
