import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { MarketAssetsTable } from "sections/lending/ui/table/market-assets/MarketAssetsTable"

export const LendingPageMarketsWip = () => {
  return (
    <LendingPageProviders>
      <MarketAssetsTable />
    </LendingPageProviders>
  )
}
