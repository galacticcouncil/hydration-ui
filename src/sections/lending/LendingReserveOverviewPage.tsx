import { Box, Typography } from "@mui/material"
import { useSearch } from "@tanstack/react-location"
import { useState } from "react"
import { ContentContainer } from "sections/lending/components/ContentContainer"
import StyledToggleButton from "sections/lending/components/StyledToggleButton"
import StyledToggleButtonGroup from "sections/lending/components/StyledToggleButtonGroup"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { ReserveActions } from "sections/lending/modules/reserve-overview/ReserveActions"
import { ReserveConfigurationWrapper } from "sections/lending/modules/reserve-overview/ReserveConfigurationWrapper"
import { ReserveTopDetailsWrapper } from "sections/lending/modules/reserve-overview/ReserveTopDetailsWrapper"
import { withHexPrefix } from "sections/lending/utils/utils"

export const LendingReserveOverviewPage = () => {
  const search = useSearch<{
    Search: {
      underlyingAsset: string
    }
  }>()
  const { reserves } = useAppDataContext()
  const underlyingAsset = search.underlyingAsset
    ? withHexPrefix(search.underlyingAsset)
    : ""

  const [mode, setMode] = useState<"overview" | "actions" | "">("overview")

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  const isOverview = mode === "overview"

  return (
    <AssetCapsProvider asset={reserve}>
      <ReserveTopDetailsWrapper underlyingAsset={underlyingAsset} />

      <ContentContainer>
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
            <StyledToggleButton value="overview" disabled={mode === "overview"}>
              <Typography variant="subheader1">
                <span>Overview</span>
              </Typography>
            </StyledToggleButton>
            <StyledToggleButton value="actions" disabled={mode === "actions"}>
              <Typography variant="subheader1">
                <span>Your info</span>
              </Typography>
            </StyledToggleButton>
          </StyledToggleButtonGroup>
        </Box>

        <Box sx={{ display: "flex" }}>
          {/** Main status and configuration panel*/}
          <Box
            sx={{
              display: { xs: !isOverview ? "none" : "block", lg: "block" },
              width: { xs: "100%", lg: "calc(100% - 432px)" },
              mr: { xs: 0, lg: 4 },
            }}
          >
            <ReserveConfigurationWrapper reserve={reserve} />
          </Box>

          {/** Right panel with actions*/}
          <Box
            sx={{
              display: { xs: isOverview ? "none" : "block", lg: "block" },
              width: { xs: "100%", lg: "416px" },
            }}
          >
            <ReserveActions reserve={reserve} />
          </Box>
        </Box>
      </ContentContainer>
    </AssetCapsProvider>
  )
}
