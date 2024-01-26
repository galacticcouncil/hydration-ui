import { ChainId } from "@aave/contract-helpers"
import { Box, Button, useMediaQuery, useTheme } from "@mui/material"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"

import { BorrowAssetsList } from "./lists/BorrowAssetsList/BorrowAssetsList"
import { BorrowedPositionsList } from "./lists/BorrowedPositionsList/BorrowedPositionsList"
import { SuppliedPositionsList } from "./lists/SuppliedPositionsList/SuppliedPositionsList"
import { SupplyAssetsList } from "./lists/SupplyAssetsList/SupplyAssetsList"
import { useNavigate } from "@tanstack/react-location"

interface DashboardContentWrapperProps {
  isBorrow: boolean
}

export const DashboardContentWrapper = ({
  isBorrow,
}: DashboardContentWrapperProps) => {
  const { breakpoints } = useTheme()
  const { currentAccount } = useWeb3Context()
  const navigate = useNavigate()

  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const isDesktop = useMediaQuery(breakpoints.up("lg"))
  const paperWidth = isDesktop ? "calc(50% - 8px)" : "100%"

  const downToLg = useMediaQuery(breakpoints.down("lg"))

  const upFromSm = useMediaQuery(breakpoints.up("xsm"))

  return (
    <Box>
      {currentMarketData.chainId === ChainId.polygon && !currentMarketData.v3}
      <Box
        sx={{
          display: isDesktop ? "flex" : "block",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <Box
          sx={{
            position: "relative",

            display: { xs: isBorrow ? "none" : "block", lg: "block" },
            width: paperWidth,
          }}
        >
          {currentAccount && !isBorrow && downToLg && (
            <Box>
              <Button
                sx={{
                  position: "absolute",
                  top: upFromSm ? "-60px" : "-90px",
                  right: "0px",
                }}
                onClick={() => {
                  navigate({ to: ROUTES.history })
                }}
                component="a"
                variant="surface"
                size="small"
              >
                <span>View transactions</span>
              </Button>
            </Box>
          )}

          <SuppliedPositionsList />
          <SupplyAssetsList />
        </Box>

        <Box
          sx={{
            position: "relative",

            display: { xs: !isBorrow ? "none" : "block", lg: "block" },
            width: paperWidth,
          }}
        >
          {currentAccount && (
            <Box
              sx={{
                position: "absolute",

                top: upFromSm ? "-60px" : "-90px",

                right: "0px",
              }}
            >
              <Button
                onClick={() => {
                  navigate({ to: ROUTES.history })
                }}
                component="a"
                variant="surface"
                size="small"
              >
                <span>View transactions</span>
              </Button>
            </Box>
          )}

          <BorrowedPositionsList />
          <BorrowAssetsList />
        </Box>
      </Box>
    </Box>
  )
}
