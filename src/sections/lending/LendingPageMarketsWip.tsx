import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { MarketsHeaderValues } from "sections/lending/ui/header/MarketsHeaderValues"
import { MarketAssetsTable } from "sections/lending/ui/table/market-assets/MarketAssetsTable"

export const LendingPageMarketsWip = () => {
  return (
    <LendingPageProviders>
      <MarketsHeaderValues sx={{ mb: [10, 40] }} />
      <MarketAssetsTable />
    </LendingPageProviders>
  )
}
