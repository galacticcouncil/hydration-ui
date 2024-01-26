import { Page } from "components/Layout/Page/Page"
import { LendingPageProviders } from "sections/lending/LendingPage.utils"

import { Box, Typography } from "@mui/material"
import StyledToggleButton from "sections/lending/components/StyledToggleButton"
import StyledToggleButtonGroup from "sections/lending/components/StyledToggleButtonGroup"
import { usePermissions } from "sections/lending/hooks/usePermissions"

import { ConnectWalletPaper } from "sections/lending/components/ConnectWalletPaper"
import { ContentContainer } from "sections/lending/components/ContentContainer"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { DashboardContentWrapper } from "sections/lending/modules/dashboard/DashboardContentWrapper"
import { DashboardTopPanel } from "sections/lending/modules/dashboard/DashboardTopPanel"
import { useState } from "react"
import { MainLayout } from "sections/lending/layouts/MainLayout"

const LandingPageContent = () => {
  const { currentAccount, loading: web3Loading } = useWeb3Context()

  const { isPermissionsLoading } = usePermissions()

  const [mode, setMode] = useState<"supply" | "borrow" | "">("supply")
  return (
    <Page>
      <MainLayout>
        <DashboardTopPanel />

        <ContentContainer>
          {currentAccount && !isPermissionsLoading && (
            <Box
              sx={{
                display: { xs: "flex", lg: "none" },
                justifyContent: { xs: "center", xsm: "flex-start" },
                mb: { xs: 3, xsm: 4 },
              }}
            >
              <StyledToggleButtonGroup
                color="primary"
                value={mode}
                exclusive
                onChange={(_, value) => setMode(value)}
                sx={{ width: { xs: "100%", xsm: "359px" }, height: "44px" }}
              >
                <StyledToggleButton value="supply" disabled={mode === "supply"}>
                  <Typography variant="subheader1">
                    <span>Supply</span>
                  </Typography>
                </StyledToggleButton>
                <StyledToggleButton value="borrow" disabled={mode === "borrow"}>
                  <Typography variant="subheader1">
                    <span>Borrow</span>
                  </Typography>
                </StyledToggleButton>
              </StyledToggleButtonGroup>
            </Box>
          )}

          {currentAccount && !isPermissionsLoading ? (
            <DashboardContentWrapper isBorrow={mode === "borrow"} />
          ) : (
            <ConnectWalletPaper loading={web3Loading} />
          )}
        </ContentContainer>
      </MainLayout>
    </Page>
  )
}

export const LendingPage = () => {
  return (
    <LendingPageProviders>
      <LandingPageContent />
    </LendingPageProviders>
  )
}
