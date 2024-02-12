import styled from "@emotion/styled"
import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { HeaderValues } from "sections/lending/ui/header/HeaderValues"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { SupplyAssetsTable } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable"
import { theme } from "theme"

const TableContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media ${theme.viewport.gte.xl} {
    grid-template-columns: 1fr 1fr;
  }
`

export const LendingPageWip = () => {
  return (
    <LendingPageProviders>
      <HeaderValues />
      <TableContainer>
        <SupplyAssetsTable />
        <BorrowAssetsTable />
      </TableContainer>
    </LendingPageProviders>
  )
}
