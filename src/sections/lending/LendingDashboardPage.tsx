import styled from "@emotion/styled"
import { DashboardHeaderValues } from "sections/lending/ui/header/DashboardHeaderValues"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable"
import { SuppliedAssetsTable } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable"
import { SupplyAssetsTable } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { Text } from "components/Typography/Text/Text"
import { Web3ConnectModalButton } from "sections/web3-connect/modal/Web3ConnectModalButton"
import { HollarBanner } from "sections/lending/ui/hollar/hollar-banner/HollarBanner"

const TableContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;

  @media ${theme.viewport.gte.xl} {
    grid-template-columns: 1fr 1fr;
  }
`

export const LendingDashboardPage = () => {
  const { account } = useAccount()
  return (
    <>
      <DashboardHeaderValues sx={{ mb: [10, 40] }} />
      {account ? (
        <>
          <HollarBanner sx={{ mb: [20, 30] }} />
          <TableContainer>
            <SuppliedAssetsTable />
            <BorrowedAssetsTable />
            <SupplyAssetsTable />
            <BorrowAssetsTable />
          </TableContainer>
        </>
      ) : (
        <div
          sx={{ flex: "column", align: "center", justify: "center", mt: 40 }}
        >
          <Text fs={24} lh={32}>
            Please, connect your wallet{" "}
          </Text>
          <Text sx={{ mb: 12 }}>
            Please connect your wallet to see your supplies, borrowings, and
            open positions.
          </Text>
          <Web3ConnectModalButton />
        </div>
      )}
    </>
  )
}
