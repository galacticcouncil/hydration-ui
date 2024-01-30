import { ChainId } from "@aave/contract-helpers"
import {
  normalize,
  UserIncentiveData,
  valueToBigNumber,
} from "@aave/math-utils"

import { Box, Button, Typography, useMediaQuery, useTheme } from "@mui/material"
import { Link } from "sections/lending/components/primitives/Link"
import { useState } from "react"
import { NetAPYTooltip } from "sections/lending/components/infoTooltips/NetAPYTooltip"
import { getMarketInfoById } from "sections/lending/components/MarketSwitcher"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { PageTitle } from "sections/lending/components/TopInfoPanel/PageTitle"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { useWeb3Context } from "sections/lending/libs/hooks/useWeb3Context"
import { useRootStore } from "sections/lending/store/root"
import { selectIsMigrationAvailable } from "sections/lending/store/v3MigrationSelectors"

import HALLink from "sections/lending/components/HALLink"
import { HealthFactorNumber } from "sections/lending/components/HealthFactorNumber"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { NoData } from "sections/lending/components/primitives/NoData"
import { TopInfoPanel } from "sections/lending/components/TopInfoPanel/TopInfoPanel"
import { TopInfoPanelItem } from "sections/lending/components/TopInfoPanel/TopInfoPanelItem"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { LiquidationRiskParametresInfoModal } from "./LiquidationRiskParametresModal/LiquidationRiskParametresModal"

export const DashboardTopPanel = () => {
  const { currentNetworkConfig, currentMarketData, currentMarket } =
    useProtocolDataContext()
  const { market } = getMarketInfoById(currentMarket)
  const { user, reserves, loading } = useAppDataContext()
  const { currentAccount } = useWeb3Context()
  const [open, setOpen] = useState(false)
  const { openClaimRewards } = useModalContext()

  const isMigrateToV3Available = useRootStore((state) =>
    selectIsMigrationAvailable(state),
  )
  const showMigrateButton =
    isMigrateToV3Available &&
    currentAccount !== "" &&
    Number(user.totalLiquidityUSD) > 0
  const theme = useTheme()
  const downToSM = useMediaQuery(theme.breakpoints.down("sm"))

  const { claimableRewardsUsd } = Object.keys(
    user.calculatedUserIncentives,
  ).reduce(
    (acc, rewardTokenAddress) => {
      const incentive: UserIncentiveData =
        user.calculatedUserIncentives[rewardTokenAddress]
      const rewardBalance = normalize(
        incentive.claimableRewards,
        incentive.rewardTokenDecimals,
      )

      let tokenPrice = 0
      // getting price from reserves for the native rewards for v2 markets
      if (!currentMarketData.v3 && Number(rewardBalance) > 0) {
        if (currentMarketData.chainId === ChainId.mainnet) {
          const aave = reserves.find((reserve) => reserve.symbol === "AAVE")
          tokenPrice = aave ? Number(aave.priceInUSD) : 0
        } else {
          reserves.forEach((reserve) => {
            if (
              reserve.symbol === currentNetworkConfig.wrappedBaseAssetSymbol
            ) {
              tokenPrice = Number(reserve.priceInUSD)
            }
          })
        }
      } else {
        tokenPrice = Number(incentive.rewardPriceFeed)
      }

      const rewardBalanceUsd = Number(rewardBalance) * tokenPrice

      if (rewardBalanceUsd > 0) {
        if (acc.assets.indexOf(incentive.rewardTokenSymbol) === -1) {
          acc.assets.push(incentive.rewardTokenSymbol)
        }

        acc.claimableRewardsUsd += Number(rewardBalanceUsd)
      }

      return acc
    },
    { claimableRewardsUsd: 0, assets: [] } as {
      claimableRewardsUsd: number
      assets: string[]
    },
  )

  const loanToValue =
    user?.totalCollateralMarketReferenceCurrency === "0"
      ? "0"
      : valueToBigNumber(user?.totalBorrowsMarketReferenceCurrency || "0")
          .dividedBy(user?.totalCollateralMarketReferenceCurrency || "1")
          .toFixed()

  const valueTypographyVariant = downToSM ? "main16" : "main21"
  const noDataTypographyVariant = downToSM ? "secondary16" : "secondary21"

  return (
    <>
      {showMigrateButton && downToSM && (
        <Box sx={{ width: "100%" }}>
          <Link href={ROUTES.migrationTool}>
            <Button
              variant="gradient"
              sx={{
                height: "40px",
                width: "100%",
              }}
            >
              <Typography variant="buttonM">
                <span>Migrate to {market.marketTitle} v3 Market</span>
              </Typography>
            </Button>
          </Link>
        </Box>
      )}
      <TopInfoPanel
        titleComponent={
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <PageTitle
              pageTitle={<span>Dashboard</span>}
              withMarketSwitcher={true}
              bridge={currentNetworkConfig.bridge}
            />
            {showMigrateButton && !downToSM && (
              <Box sx={{ alignSelf: "center", mb: 16, width: "100%" }}>
                <Link href={ROUTES.migrationTool}>
                  <Button variant="gradient" sx={{ height: "20px" }}>
                    <Typography variant="buttonS" data-cy={`migration-button`}>
                      <span>Migrate to v3</span>
                    </Typography>
                  </Button>
                </Link>
              </Box>
            )}
          </Box>
        }
      >
        <TopInfoPanelItem
          title={<span>Net worth</span>}
          loading={loading}
          hideIcon
        >
          {currentAccount ? (
            <FormattedNumber
              value={Number(user?.netWorthUSD || 0)}
              symbol="USD"
              variant={valueTypographyVariant}
              visibleDecimals={2}
              compact
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: "0.7" }} />
          )}
        </TopInfoPanelItem>

        <TopInfoPanelItem
          title={
            <div style={{ display: "flex" }}>
              <span>Net APY</span>
              <NetAPYTooltip />
            </div>
          }
          loading={loading}
          hideIcon
        >
          {currentAccount && Number(user?.netWorthUSD) > 0 ? (
            <FormattedNumber
              value={user.netAPY}
              variant={valueTypographyVariant}
              visibleDecimals={2}
              percent
              symbolsColor="#A5A8B6"
              symbolsVariant={noDataTypographyVariant}
            />
          ) : (
            <NoData variant={noDataTypographyVariant} sx={{ opacity: "0.7" }} />
          )}
        </TopInfoPanelItem>

        {currentAccount && user?.healthFactor !== "-1" && (
          <TopInfoPanelItem
            title={
              <Box sx={{ display: "inline-flex", alignItems: "center" }}>
                <span>Health factor</span>
              </Box>
            }
            loading={loading}
            hideIcon
          >
            <HealthFactorNumber
              value={user?.healthFactor || "-1"}
              variant={valueTypographyVariant}
              onInfoClick={() => {
                setOpen(true)
              }}
              HALIntegrationComponent={
                currentMarketData.halIntegration && (
                  <HALLink
                    healthFactor={user?.healthFactor || "-1"}
                    marketName={currentMarketData.halIntegration.marketName}
                    integrationURL={currentMarketData.halIntegration.URL}
                  />
                )
              }
            />
          </TopInfoPanelItem>
        )}

        {currentAccount && claimableRewardsUsd > 0 && (
          <TopInfoPanelItem
            title={<span>Available rewards</span>}
            loading={loading}
            hideIcon
          >
            <Box
              sx={{
                display: "flex",
                alignItems: { xs: "flex-start", xsm: "center" },
                flexDirection: { xs: "column", xsm: "row" },
              }}
            >
              <Box
                sx={{ display: "inline-flex", alignItems: "center" }}
                data-cy={"Claim_Box"}
              >
                <FormattedNumber
                  value={claimableRewardsUsd}
                  variant={valueTypographyVariant}
                  visibleDecimals={2}
                  compact
                  symbol="USD"
                  symbolsColor="#A5A8B6"
                  symbolsVariant={noDataTypographyVariant}
                  data-cy={"Claim_Value"}
                />
              </Box>

              <Button
                variant="gradient"
                size="small"
                onClick={() => openClaimRewards()}
                sx={{ minWidth: "unset", ml: { xs: 0, xsm: 2 } }}
                data-cy={"Dashboard_Claim_Button"}
              >
                <span>Claim</span>
              </Button>
            </Box>
          </TopInfoPanelItem>
        )}
      </TopInfoPanel>
      <LiquidationRiskParametresInfoModal
        open={open}
        setOpen={setOpen}
        healthFactor={user?.healthFactor || "-1"}
        loanToValue={loanToValue}
        currentLoanToValue={user?.currentLoanToValue || "0"}
        currentLiquidationThreshold={user?.currentLiquidationThreshold || "0"}
      />
    </>
  )
}
