import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { HeaderValues } from "sections/lending/ui/header/HeaderValues"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { SupplyAssetsTable } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable"

export const LendingPageWip = () => {
  return (
    <LendingPageProviders>
      <HeaderValues />
      <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <SupplyAssetsTable />
        <BorrowAssetsTable />
      </div>
    </LendingPageProviders>
  )
}
