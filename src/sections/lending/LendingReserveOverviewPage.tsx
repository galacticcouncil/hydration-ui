import { Button } from "components/Button/Button"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import {
  ComputedReserveData,
  useAppDataContext,
} from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapsProvider } from "sections/lending/hooks/useAssetCaps"
import { ReserveOverviewHeaderValues } from "sections/lending/ui/header/ReserveOverviewHeaderValues"
import { ReserveActions } from "sections/lending/ui/reserve-overview/ReserveActions"
import { ReserveConfiguration } from "sections/lending/ui/reserve-overview/ReserveConfiguration"
import {
  SContainer,
  SContent,
  SFilterContainer,
} from "./LendingReserveOverviewPage.styled"

export type LendingReserveOverviewPageProps = {
  underlyingAsset: string
}

export const LendingReserveOverviewPage: React.FC<
  LendingReserveOverviewPageProps
> = ({ underlyingAsset }) => {
  const { t } = useTranslation()

  const { reserves } = useAppDataContext()

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
          {t("lending.reserve.overview")}
        </Button>
        <Button
          active={mode === "actions"}
          fullWidth
          variant="outline"
          size="small"
          onClick={() => setMode("actions")}
        >
          {t("lending.reserve.yourInfo")}
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
