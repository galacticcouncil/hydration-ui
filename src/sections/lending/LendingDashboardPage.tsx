import { useState } from "react"
import { useMedia } from "react-use"
import { DashboardHeaderValues } from "sections/lending/ui/header/DashboardHeaderValues"
import { HollarBanner } from "sections/lending/ui/hollar/hollar-banner/HollarBanner"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable"
import { SuppliedAssetsTable } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable"
import { SupplyAssetsTable } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable"
import { theme } from "theme"
import { SContainer, SFilterContainer } from "./LendingDashboardPage.styled"
import { Button } from "components/Button/Button"

export const LendingDashboardPage = () => {
  const [mode, setMode] = useState<"supply" | "borrow">("supply")
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const shouldRenderSupply = mode === "supply" || isDesktop
  const shouldRenderBorrow = mode === "borrow" || isDesktop

  return (
    <>
      <DashboardHeaderValues sx={{ mb: [10, 40] }} />
      <HollarBanner sx={{ mb: [20, 30] }} />
      {!isDesktop && (
        <SFilterContainer>
          <Button
            active={mode === "supply"}
            fullWidth
            variant="outline"
            size="small"
            onClick={() => setMode("supply")}
          >
            Supply
          </Button>
          <Button
            active={mode === "borrow"}
            fullWidth
            variant="outline"
            size="small"
            onClick={() => setMode("borrow")}
          >
            Borrow
          </Button>
        </SFilterContainer>
      )}
      <SContainer>
        {shouldRenderSupply && <SuppliedAssetsTable />}
        {shouldRenderBorrow && <BorrowedAssetsTable />}
        {shouldRenderSupply && <SupplyAssetsTable />}
        {shouldRenderBorrow && <BorrowAssetsTable />}
      </SContainer>
    </>
  )
}
