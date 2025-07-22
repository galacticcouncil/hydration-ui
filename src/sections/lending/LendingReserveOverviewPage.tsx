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
import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { MoneyMarketBanner } from "sections/lending/ui/money-market/MoneyMarketBanner"
import { ReserveActionsSkeleton } from "sections/lending/skeleton/LendingReserveOverviewSkeleton"
import { useRootStore } from "sections/lending/store/root"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { GhoReserveConfiguration } from "sections/lending/ui/reserve-overview/gho/GhoReserveConfiguration"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"

export type LendingReserveOverviewPageProps = {
  underlyingAsset: string
}

export const LendingReserveOverviewPage: React.FC<
  LendingReserveOverviewPageProps
> = ({ underlyingAsset }) => {
  const { t } = useTranslation()
  const displayGho = useRootStore((store) => store.displayGho)
  const { reserves } = useAppDataContext()
  const { currentMarket } = useProtocolDataContext()

  const { isBound, isLoading } = useEvmAccount()

  const isActionsDisabled = MONEY_MARKET_GIGA_RESERVES.includes(underlyingAsset)

  const reserve = reserves.find(
    (reserve) => reserve.underlyingAsset === underlyingAsset,
  ) as ComputedReserveData

  const [mode, setMode] = useState<"overview" | "actions">("overview")

  const isGho = displayGho({
    symbol: reserve.symbol,
    currentMarket,
  })

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
          {isGho ? (
            <GhoReserveConfiguration reserve={reserve} />
          ) : (
            <ReserveConfiguration reserve={reserve} />
          )}
        </SContainer>
        {isLoading ? (
          <SContainer>
            <ReserveActionsSkeleton />
          </SContainer>
        ) : (
          <>
            {isBound && !isActionsDisabled && (
              <SContainer>
                <ReserveActions reserve={reserve} />
              </SContainer>
            )}
            {!isBound && <MoneyMarketBanner />}
          </>
        )}
      </SContent>
    </AssetCapsProvider>
  )
}
