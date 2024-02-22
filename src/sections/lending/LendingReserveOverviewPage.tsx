import { useSearch } from "@tanstack/react-location"
import { Button } from "components/Button/Button"
import { useState } from "react"
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
  SFilterContainer,
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

      <SFilterContainer>
        <Button
          active={mode === "overview"}
          fullWidth
          variant="outline"
          size="small"
          onClick={() => setMode("overview")}
        >
          Overview
        </Button>
        <Button
          active={mode === "actions"}
          fullWidth
          variant="outline"
          size="small"
          onClick={() => setMode("actions")}
        >
          Your info
        </Button>
      </SFilterContainer>

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
