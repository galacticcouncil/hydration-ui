import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { HeaderValues } from "sections/lending/ui/header/HeaderValues"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"

export const LendingPageWip = () => {
  return (
    <LendingPageProviders>
      <HeaderValues />
      <div css={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        <BorrowAssetsTable />
      </div>
    </LendingPageProviders>
  )
}
