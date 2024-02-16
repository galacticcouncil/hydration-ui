import { MarketsHeaderValues } from "sections/lending/ui/header/MarketsHeaderValues"
import { HollarBanner } from "sections/lending/ui/hollar/hollar-banner/HollarBanner"
import { MarketAssetsTable } from "sections/lending/ui/table/market-assets/MarketAssetsTable"

export const LendingMarketsPage = () => {
  return (
    <>
      <MarketsHeaderValues sx={{ mb: [10, 40] }} />
      <HollarBanner sx={{ mb: [20, 30] }} />
      <MarketAssetsTable />
    </>
  )
}
