import styled from "@emotion/styled"
import { LendingPageProviders } from "sections/lending/providers/LendingPageProviders"
import { DashboardHeaderValues } from "sections/lending/ui/header/DashboardHeaderValues"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable"
import { SuppliedAssetsTable } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable"
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
      <DashboardHeaderValues sx={{ mb: [10, 40] }} />
      <TableContainer>
        <SuppliedAssetsTable />
        <BorrowedAssetsTable />
        <SupplyAssetsTable />
        <BorrowAssetsTable />
      </TableContainer>
    </LendingPageProviders>
  )
}
