import { Button } from "components/Button/Button"
import { useState } from "react"
import { useMedia } from "react-use"
import { DashboardHeaderValues } from "sections/lending/ui/header/DashboardHeaderValues"
import { HollarBanner } from "sections/lending/ui/hollar/hollar-banner/HollarBanner"
import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { BorrowAssetsTable } from "sections/lending/ui/table/borrow-assets/BorrowAssetsTable"
import { BorrowedAssetsTable } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable"
import { SuppliedAssetsTable } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable"
import { SupplyAssetsTable } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable"
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { theme } from "theme"
import { SContainer, SFilterContainer } from "./LendingDashboardPage.styled"
import { useIsEvmAccountBound } from "sections/lending/hooks/useIsEvmAccountBound"
import { useTranslation } from "react-i18next"

export const LendingDashboardPage = () => {
  const { t } = useTranslation()
  const [mode, setMode] = useState<"supply" | "borrow">("supply")
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const shouldRenderSupply = mode === "supply" || isDesktop
  const shouldRenderBorrow = mode === "borrow" || isDesktop

  const { account: evmAccount } = useEvmAccount()

  const { data: isBound, isLoading } = useIsEvmAccountBound(evmAccount?.address)

  return (
    <>
      <DashboardHeaderValues sx={{ mb: [10, 40] }} />
      {!isLoading && !isBound && <MoneyMarketBanner sx={{ mb: [20, 30] }} />}
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
            {t("lending.supply")}
          </Button>
          <Button
            active={mode === "borrow"}
            fullWidth
            variant="outline"
            size="small"
            onClick={() => setMode("borrow")}
          >
            {t("lending.borrow")}
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
