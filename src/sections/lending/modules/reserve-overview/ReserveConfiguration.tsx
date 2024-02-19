import { ExternalLinkIcon } from "@heroicons/react/solid"
import { Box, Button, SvgIcon } from "@mui/material"
import { AMPLWarning } from "sections/lending/components/Warnings/AMPLWarning"
import { BorrowDisabledWarning } from "sections/lending/components/Warnings/BorrowDisabledWarning"
import {
  AssetsBeingOffboarded,
  OffboardingWarning,
} from "sections/lending/components/Warnings/OffboardingWarning"
import { getFrozenProposalLink } from "sections/lending/components/infoTooltips/FrozenTooltip"
import { PausedTooltipText } from "sections/lending/components/infoTooltips/PausedTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { BROKEN_ASSETS } from "sections/lending/hooks/useReservesHistory"
import { BorrowInfo } from "./BorrowInfo"
import { ReserveEModePanel } from "./ReserveEModePanel"
import { PanelItem, PanelTitle } from "./ReservePanels"
import { SupplyInfo } from "./SupplyInfo"
import { InterestRateModelGraphContainer } from "./graphs/InterestRateModelGraphContainer"

type ReserveConfigurationProps = {
  reserve: ComputedReserveData
}

export const ReserveConfiguration: React.FC<ReserveConfigurationProps> = ({
  reserve,
}) => {
  const { currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext()
  const reserveId =
    reserve.underlyingAsset +
    currentMarketData.addresses.LENDING_POOL_ADDRESS_PROVIDER
  const renderCharts =
    !!currentNetworkConfig.ratesHistoryApiUrl &&
    !currentMarketData.disableCharts &&
    !BROKEN_ASSETS.includes(reserveId)
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps()
  const showSupplyCapStatus: boolean = reserve.supplyCap !== "0"
  const showBorrowCapStatus: boolean = reserve.borrowCap !== "0"

  const offboardingDiscussion =
    AssetsBeingOffboarded[currentMarket]?.[reserve.symbol]

  return (
    <>
      <Box>
        {reserve.isFrozen && !offboardingDiscussion ? (
          <Warning sx={{ mt: "16px", mb: "40px" }} variant="error">
            <span>
              This asset is frozen due to an Aave community decision.{" "}
              <Link
                href={getFrozenProposalLink(reserve.symbol, currentMarket)}
                sx={{ textDecoration: "underline" }}
              >
                <span>More details</span>
              </Link>
            </span>
          </Warning>
        ) : offboardingDiscussion ? (
          <Warning sx={{ mt: "16px", mb: "40px" }} variant="error">
            <OffboardingWarning discussionLink={offboardingDiscussion} />
          </Warning>
        ) : (
          reserve.symbol === "AMPL" && (
            <Warning sx={{ mt: "16px", mb: "40px" }} variant="warning">
              <AMPLWarning />
            </Warning>
          )
        )}

        {reserve.isPaused ? (
          reserve.symbol === "MAI" ? (
            <Warning sx={{ mt: "16px", mb: "40px" }} variant="error">
              <span>
                MAI has been paused due to a community decision. Supply, borrows
                and repays are impacted.{" "}
                <Link
                  href={
                    "https://governance.aave.com/t/arfc-add-mai-to-arbitrum-aave-v3-market/12759/8"
                  }
                  sx={{ textDecoration: "underline" }}
                >
                  <span>More details</span>
                </Link>
              </span>
            </Warning>
          ) : (
            <Warning sx={{ mt: "16px", mb: "40px" }} variant="error">
              <PausedTooltipText />
            </Warning>
          )
        ) : null}
      </Box>

      <PanelTitle color="brightBlue300">Supply Info</PanelTitle>
      <SupplyInfo
        reserve={reserve}
        currentMarketData={currentMarketData}
        renderCharts={renderCharts}
        showSupplyCapStatus={showSupplyCapStatus}
        supplyCap={supplyCap}
        debtCeiling={debtCeiling}
      />

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <div sx={{ bg: "bg", height: 6, mx: [-20, -35], my: [20, 40] }} />
          <PanelTitle color="pink500">Borrow info</PanelTitle>
          <Box
            sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}
          >
            {!reserve.borrowingEnabled && (
              <Warning sx={{ mb: "40px" }} variant="error">
                <BorrowDisabledWarning
                  symbol={reserve.symbol}
                  currentMarket={currentMarket}
                />
              </Warning>
            )}
            <BorrowInfo
              reserve={reserve}
              currentMarketData={currentMarketData}
              currentNetworkConfig={currentNetworkConfig}
              renderCharts={renderCharts}
              showBorrowCapStatus={showBorrowCapStatus}
              borrowCap={borrowCap}
            />
          </Box>
        </>
      )}

      {reserve.eModeCategoryId !== 0 && (
        <>
          <div sx={{ bg: "bg", height: 6, mx: [-20, -35], my: [20, 40] }} />
          <ReserveEModePanel reserve={reserve} />
        </>
      )}

      {(reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
        <>
          <div sx={{ bg: "bg", height: 6, mx: [-20, -35], my: [20, 40] }} />

          <PanelTitle color="brightBlue700">Interest rate model</PanelTitle>
          <Box
            sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                flexWrap: "wrap",
                justifyContent: "space-between",
              }}
            >
              <PanelItem title="Utilization Rate" className="borderless">
                <FormattedNumber
                  value={reserve.borrowUsageRatio}
                  percent
                  variant="main16"
                  compact
                />
              </PanelItem>
              <Button
                href={currentNetworkConfig.explorerLinkBuilder({
                  address: reserve.interestRateStrategyAddress,
                })}
                endIcon={
                  <SvgIcon sx={{ width: 14, height: 14 }}>
                    <ExternalLinkIcon />
                  </SvgIcon>
                }
                component={Link}
                size="small"
                variant="outlined"
                sx={{ verticalAlign: "top" }}
              >
                <span>Interest rate strategy</span>
              </Button>
            </Box>
            <InterestRateModelGraphContainer reserve={reserve} />
          </Box>
        </>
      )}
    </>
  )
}
