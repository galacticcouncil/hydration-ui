import { valueToBigNumber } from "@aave/math-utils"

import CheckRoundedIcon from "@mui/icons-material/CheckRounded"
import { AlertTitle, Box, Typography } from "@mui/material"
import { CapsCircularStatus } from "sections/lending/components/caps/CapsCircularStatus"
import { DebtCeilingStatus } from "sections/lending/components/caps/DebtCeilingStatus"
import { IncentivesButton } from "sections/lending/components/incentives/IncentivesButton"
import { LiquidationPenaltyTooltip } from "sections/lending/components/infoTooltips/LiquidationPenaltyTooltip"
import { LiquidationThresholdTooltip } from "sections/lending/components/infoTooltips/LiquidationThresholdTooltip"
import { MaxLTVTooltip } from "sections/lending/components/infoTooltips/MaxLTVTooltip"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { Link } from "sections/lending/components/primitives/Link"
import { Warning } from "sections/lending/components/primitives/Warning"
import { ReserveOverviewBox } from "sections/lending/components/ReserveOverviewBox"
import { ReserveSubheader } from "sections/lending/components/ReserveSubheader"
import { TextWithTooltip } from "sections/lending/components/TextWithTooltip"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { AssetCapHookData } from "sections/lending/hooks/useAssetCaps"
import { MarketDataType } from "sections/lending/utils/marketsAndNetworksConfig"

import { ApyGraphContainer } from "./graphs/ApyGraphContainer"
import { PanelItem } from "./ReservePanels"

interface SupplyInfoProps {
  reserve: ComputedReserveData
  currentMarketData: MarketDataType
  renderCharts: boolean
  showSupplyCapStatus: boolean
  supplyCap: AssetCapHookData
  debtCeiling: AssetCapHookData
}

export const SupplyInfo = ({
  reserve,
  currentMarketData,
  renderCharts,
  showSupplyCapStatus,
  supplyCap,
  debtCeiling,
}: SupplyInfoProps) => {
  return (
    <Box sx={{ flexGrow: 1, minWidth: 0, maxWidth: "100%", width: "100%" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        {showSupplyCapStatus ? (
          // With supply cap
          <>
            <CapsCircularStatus
              value={supplyCap.percentUsed}
              tooltipContent={
                <>
                  <span>
                    Maximum amount available to supply is{" "}
                    <FormattedNumber
                      value={
                        valueToBigNumber(reserve.supplyCap).toNumber() -
                        valueToBigNumber(reserve.totalLiquidity).toNumber()
                      }
                      variant="secondary12"
                    />{" "}
                    {reserve.symbol} (
                    <FormattedNumber
                      value={
                        valueToBigNumber(reserve.supplyCapUSD).toNumber() -
                        valueToBigNumber(reserve.totalLiquidityUSD).toNumber()
                      }
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
                  <span>Total supplied</span>
                  <TextWithTooltip>
                    <>
                      <span>
                        Asset supply is limited to a certain amount to reduce
                        protocol exposure to the asset and to help manage risks
                        involved.
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
                <FormattedNumber
                  value={reserve.totalLiquidity}
                  variant="main16"
                  compact
                />
                <Typography
                  component="span"
                  color="text.primary"
                  variant="secondary16"
                  sx={{ display: "inline-block", mx: 1 }}
                >
                  <span>of</span>
                </Typography>
                <FormattedNumber value={reserve.supplyCap} variant="main16" />
              </Box>
              <Box>
                <ReserveSubheader value={reserve.totalLiquidityUSD} />
                <Typography
                  component="span"
                  color="text.secondary"
                  variant="secondary12"
                  sx={{ display: "inline-block", mx: 1 }}
                >
                  <span>of</span>
                </Typography>
                <ReserveSubheader value={reserve.supplyCapUSD} />
              </Box>
            </PanelItem>
          </>
        ) : (
          // Without supply cap
          <PanelItem
            title={
              <Box display="flex" alignItems="center">
                <span>Total supplied</span>
              </Box>
            }
          >
            <FormattedNumber
              value={reserve.totalLiquidity}
              variant="main16"
              compact
            />
            <ReserveSubheader value={reserve.totalLiquidityUSD} />
          </PanelItem>
        )}
        <PanelItem title={<span>APY</span>}>
          <FormattedNumber value={reserve.supplyAPY} percent variant="main16" />
          <IncentivesButton
            symbol={reserve.symbol}
            incentives={reserve.aIncentivesData}
            displayBlank={true}
          />
        </PanelItem>
        {reserve.unbacked && reserve.unbacked !== "0" && (
          <PanelItem title={<span>Unbacked</span>}>
            <FormattedNumber
              value={reserve.unbacked}
              variant="main16"
              symbol={reserve.name}
            />
            <ReserveSubheader value={reserve.unbackedUSD} />
          </PanelItem>
        )}
      </Box>
      {renderCharts &&
        (reserve.borrowingEnabled || Number(reserve.totalDebt) > 0) && (
          <ApyGraphContainer
            graphKey="supply"
            reserve={reserve}
            currentMarketData={currentMarketData}
          />
        )}
      <div>
        {reserve.isIsolated ? (
          <Box sx={{ pt: "42px", pb: "12px" }}>
            <Typography
              variant="subheader1"
              color="text.main"
              paddingBottom={"12px"}
            >
              <span>Collateral usage</span>
            </Typography>
            <Warning severity="warning">
              <Typography variant="subheader1">
                <span>
                  Asset can only be used as collateral in isolation mode only.
                </span>
              </Typography>
              <Typography variant="caption">
                In Isolation mode you cannot supply other assets as collateral
                for borrowing. Assets used as collateral in Isolation mode can
                only be borrowed to a specific debt ceiling.{" "}
                <Link href="https://docs.aave.com/faq/aave-v3-features#isolation-mode">
                  Learn more
                </Link>
              </Typography>
            </Warning>
          </Box>
        ) : reserve.reserveLiquidationThreshold !== "0" ? (
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
              <span>Collateral usage</span>
            </Typography>
            <CheckRoundedIcon fontSize="small" color="success" sx={{ ml: 8 }} />
            <Typography variant="subheader1" sx={{ color: "#46BC4B" }}>
              <span>Can be collateral</span>
            </Typography>
          </Box>
        ) : (
          <Box sx={{ pt: "42px", pb: "12px" }}>
            <Typography variant="subheader1" color="text.main">
              <span>Collateral usage</span>
            </Typography>
            <Warning sx={{ my: "12px" }} severity="warning">
              <span>Asset cannot be used as collateral.</span>
            </Warning>
          </Box>
        )}
      </div>
      {reserve.reserveLiquidationThreshold !== "0" && (
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
          }}
        >
          <ReserveOverviewBox
            title={
              <MaxLTVTooltip
                variant="description"
                text={<span>Max LTV</span>}
              />
            }
          >
            <FormattedNumber
              value={reserve.formattedBaseLTVasCollateral}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          <ReserveOverviewBox
            title={
              <LiquidationThresholdTooltip
                variant="description"
                text={<span>Liquidation threshold</span>}
              />
            }
          >
            <FormattedNumber
              value={reserve.formattedReserveLiquidationThreshold}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          <ReserveOverviewBox
            title={
              <LiquidationPenaltyTooltip
                variant="description"
                text={<span>Liquidation penalty</span>}
              />
            }
          >
            <FormattedNumber
              value={reserve.formattedReserveLiquidationBonus}
              percent
              variant="secondary14"
              visibleDecimals={2}
            />
          </ReserveOverviewBox>

          {reserve.isIsolated && (
            <ReserveOverviewBox fullWidth>
              <DebtCeilingStatus
                debt={reserve.isolationModeTotalDebtUSD}
                ceiling={reserve.debtCeilingUSD}
                usageData={debtCeiling}
              />
            </ReserveOverviewBox>
          )}
        </Box>
      )}
      {reserve.symbol === "stETH" && (
        <Box>
          <Warning severity="info">
            <AlertTitle>
              <span>Staking Rewards</span>
            </AlertTitle>
            <span>
              stETH supplied as collateral will continue to accrue staking
              rewards provided by daily rebases.
            </span>{" "}
            <Link
              href="https://blog.lido.fi/aave-integrates-lidos-steth-as-collateral/"
              underline="always"
            >
              <span>Learn more</span>
            </Link>
          </Warning>
        </Box>
      )}
    </Box>
  )
}
