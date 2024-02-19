import { Box } from "@mui/material"
import { useSearch } from "@tanstack/react-location"
import { FC, ReactNode } from "react"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { ReserveActions } from "sections/lending/modules/reserve-overview/ReserveActions"
import { ReserveConfigurationWrapper } from "sections/lending/modules/reserve-overview/ReserveConfigurationWrapper"
import { ReserveOverviewHeaderValues } from "sections/lending/ui/header/ReserveOverviewHeaderValues"
import { withHexPrefix } from "sections/lending/utils/utils"
import { theme } from "theme"

const Container: FC<{ children: ReactNode }> = ({ children }) => (
  <div
    css={{
      background: theme.colors.darkBlue700,
      border: "1px solid rgba(152, 176, 214, 0.27)",
      borderRadius: theme.borderRadius.medium,
    }}
    sx={{ p: [20, 30] }}
  >
    {children}
  </div>
)

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

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  return (
    <AssetCapsProvider asset={reserve}>
      <ReserveOverviewHeaderValues
        sx={{ mb: [10, 40] }}
        underlyingAsset={underlyingAsset}
      />

      {/* <Container>
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
      </Container> */}

      <Box sx={{ display: "flex" }}>
        <Box
          sx={{
            width: { xs: "100%", lg: "calc(100% - 432px)" },
            mr: { xs: 0, lg: 4 },
          }}
        >
          <Container>
            <ReserveConfigurationWrapper reserve={reserve} />
          </Container>
        </Box>
        <Box
          sx={{
            width: { xs: "100%", lg: "416px" },
          }}
        >
          <Container>
            <ReserveActions reserve={reserve} />
          </Container>
        </Box>
      </Box>
    </AssetCapsProvider>
  )
}
