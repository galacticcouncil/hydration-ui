import { useSearch } from "@tanstack/react-location"
import { useState } from "react"
import StyledToggleButton from "sections/lending/components/StyledToggleButton"
import StyledToggleButtonGroup from "sections/lending/components/StyledToggleButtonGroup"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { ReserveActions } from "sections/lending/modules/reserve-overview/ReserveActions"
import { ReserveOverviewHeaderValues } from "sections/lending/ui/header/ReserveOverviewHeaderValues"
import { ReserveConfiguration } from "sections/lending/ui/reserve-overview/ReserveConfiguration"
import { withHexPrefix } from "sections/lending/utils/utils"
import {
  SContainer,
  SContent,
  SToggleContainer,
} from "./LendingReserveOverviewPage.styled"

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

  const [mode, setMode] = useState<"overview" | "actions">("overview")

  return (
    <AssetCapsProvider asset={reserve}>
      <ReserveOverviewHeaderValues
        sx={{ mb: [10, 40] }}
        underlyingAsset={underlyingAsset}
      />

      <SToggleContainer>
        <StyledToggleButtonGroup
          color="primary"
          value={mode}
          exclusive
          onChange={(_, value) => setMode(value)}
          sx={{ width: { xs: "100%", xsm: "359px" }, height: "44px" }}
        >
          <StyledToggleButton value="overview" disabled={mode === "overview"}>
            Overview
          </StyledToggleButton>
          <StyledToggleButton value="actions" disabled={mode === "actions"}>
            Your info
          </StyledToggleButton>
        </StyledToggleButtonGroup>
      </SToggleContainer>

      <SContent>
        <SContainer active={mode === "overview"}>
          <ReserveConfiguration reserve={reserve} />
        </SContainer>
        <SContainer active={mode === "actions"}>
          <ReserveActions reserve={reserve} />
        </SContainer>
      </SContent>
    </AssetCapsProvider>
  )
}
