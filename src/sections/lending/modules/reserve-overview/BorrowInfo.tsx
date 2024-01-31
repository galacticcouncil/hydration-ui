import { valueToBigNumber } from "@aave/math-utils"

import { Box, Typography } from "@mui/material"
import { BigNumber } from "bignumber.js"
import { CapsCircularStatus } from "sections/lending/components/caps/CapsCircularStatus"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"
import { VariableAPYTooltip } from "sections/lending/components/infoTooltips/VariableAPYTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { ReserveSubheader } from "sections/lending/components/ReserveSubheader"
import { TextWithTooltip } from "sections/lending/components/TextWithTooltip"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapHookData } from "sections/lending/hooks/useAssetCaps"
import {
  MarketDataType,
  NetworkConfig,
} from "sections/lending/utils/marketsAndNetworksConfig"

import { ApyGraphContainer } from "./graphs/ApyGraphContainer"
import { ReserveFactorOverview } from "./ReserveFactorOverview"
import { PanelItem } from "./ReservePanels"

interface BorrowInfoProps {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  currentNetworkConfig: NetworkConfig
  renderCharts: boolean
  showBorrowCapStatus: boolean
  borrowCap: AssetCapHookData
}

export const BorrowInfo = ({
  reserve,
  currentMarketData,
  currentNetworkConfig,
  renderCharts,
  showBorrowCapStatus,
  borrowCap,
}: BorrowInfoProps) => {
  const maxAvailableToBorrow = BigNumber.max(
    valueToBigNumber(reserve.borrowCap).minus(
      valueToBigNumber(reserve.totalDebt),
    ),
    0,
  ).toNumber()

  const maxAvailableToBorrowUSD = BigNumber.max(
    valueToBigNumber(reserve.borrowCapUSD).minus(
      valueToBigNumber(reserve.totalDebtUSD),
    ),
    0,
  ).toNumber()

  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {showBorrowCapStatus ? (
          // With a borrow cap
          <>
            <CapsCircularStatus
              value={borrowCap.percentUsed}
              tooltipContent={
                <>
                  <span>
                    Maximum amount available to borrow is{" "}
                    <FormattedNumber
                      value={maxAvailableToBorrow}
                      variant="secondary12"
                    />{" "}
                    {reserve.symbol} (
                    <FormattedNumber
                      value={maxAvailableToBorrowUSD}
                      variant="secondary12"
                      symbol="USD"
                    />
                    ).
                  </span>
                </>
              }
            />
            <PanelItem
              title={
                <Box display="flex" alignItems="center">
                  <span>Total borrowed</span>
                  <TextWithTooltip>
                    <>
                      <span>
                        Borrowing of this asset is limited to a certain amount
                        to minimize liquidity pool insolvency.
                      </span>{" "}
                      <Link
                        href="https://docs.aave.com/developers/whats-new/supply-borrow-caps"
                        underline="always"
                      >
                        <span>Learn more</span>
                      </Link>
                    </>
                  </TextWithTooltip>
                </Box>
              }
            >
              <Box>
                <FormattedNumber value={reserve.totalDebt} variant="main16" />
                <Typography
                  component="span"
                  color="text.primary"
                  variant="secondary16"
                  sx={{ display: "inline-block", mx: 4 }}
                >
                  <span>of</span>
                </Typography>
                <FormattedNumber value={reserve.borrowCap} variant="main16" />
              </Box>
              <Box>
                <ReserveSubheader value={reserve.totalDebtUSD} />
                <Typography
                  component="span"
                  color="text.primary"
                  variant="secondary16"
                  sx={{ display: "inline-block", mx: 4 }}
                >
                  <span>of</span>
                </Typography>
                <ReserveSubheader value={reserve.borrowCapUSD} />
              </Box>
            </PanelItem>
          </>
        ) : (
          // Without a borrow cap
          <PanelItem
            title={
              <Box display="flex" alignItems="center">
                <span>Total borrowed</span>
              </Box>
            }
          >
            <FormattedNumber value={reserve.totalDebt} variant="main16" />
            <ReserveSubheader value={reserve.totalDebtUSD} />
          </PanelItem>
        )}
        <PanelItem
          title={
            <VariableAPYTooltip
              text={<span>APY, variable</span>}
              key="APY_res_variable_type"
              variant="description"
            />
          }
        >
          <FormattedNumber
            value={reserve.variableBorrowAPY}
            percent
            variant="main16"
          />
          <IncentivesButton
            symbol={reserve.symbol}
            incentives={reserve.vIncentivesData}
            displayBlank={true}
          />
        </PanelItem>
        {/* {reserve.stableBorrowRateEnabled && (
          <PanelItem
            title={
              <StableAPYTooltip
                event={{
                  eventName: GENERAL.TOOL_TIP,
                  eventParams: {
                    tooltip: 'APY, stable',
                    asset: reserve.underlyingAsset,
                    assetName: reserve.name,
                  },
                }}
                text={<span>APY, stable</span>}
                key="APY_res_stable_type"
                variant="description"
              />
            }
          >
            <FormattedNumber value={reserve.stableBorrowAPY} percent variant="main16" />
            <IncentivesButton
              symbol={reserve.symbol}
              incentives={reserve.sIncentivesData}
              displayBlank={true}
            />
          </PanelItem>
        )} */}
        {reserve.borrowCapUSD && reserve.borrowCapUSD !== "0" && (
          <PanelItem title={<span>Borrow cap</span>}>
            <FormattedNumber value={reserve.borrowCap} variant="main16" />
            <ReserveSubheader value={reserve.borrowCapUSD} />
          </PanelItem>
        )}
      </Box>
      {renderCharts && (
        <ApyGraphContainer
          graphKey="borrow"
          reserve={reserve}
          currentMarketData={currentMarketData}
        />
      )}
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          pt: "42px",
          pb: "12px",
        }}
        paddingTop={"42px"}
      >
        <Typography variant="subheader1" color="text.main">
          <span>Collector Info</span>
        </Typography>
      </Box>
      {currentMarketData.addresses.COLLECTOR && (
        <ReserveFactorOverview
          collectorContract={currentMarketData.addresses.COLLECTOR}
          explorerLinkBuilder={currentNetworkConfig.explorerLinkBuilder}
          reserveFactor={reserve.reserveFactor}
          reserveName={reserve.name}
          reserveAsset={reserve.underlyingAsset}
        />
      )}
    </Box>
  )
}
