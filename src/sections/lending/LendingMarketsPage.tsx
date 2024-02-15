import { MarketsHeaderValues } from "sections/lending/ui/header/MarketsHeaderValues"
import { MarketAssetsTable } from "sections/lending/ui/table/market-assets/MarketAssetsTable"

export const LendingMarketsPage = () => {
  return (
    <>
      <MarketsHeaderValues sx={{ mb: [10, 40] }} />
      <MarketAssetsTable />
    </>
  )
}
