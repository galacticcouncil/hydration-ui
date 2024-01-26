import { Box, Button } from "@mui/material"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { IncentivesCard } from "sections/lending/components/incentives/IncentivesCard"
import { Row } from "sections/lending/components/primitives/Row"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"
import { ListItemUsedAsCollateral } from "sections/lending/modules/dashboard/lists/ListItemUsedAsCollateral"
import { ListMobileItemWrapper } from "sections/lending/modules/dashboard/lists/ListMobileItemWrapper"
import { ListValueRow } from "sections/lending/modules/dashboard/lists/ListValueRow"

export const SuppliedPositionsListMobileItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext()
  const { currentMarketData, currentMarket } = useProtocolDataContext()
  const { openSupply, openSwap, openWithdraw, openCollateralChange } =
    useModalContext()
  const { debtCeiling } = useAssetCaps()
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData)
  const {
    symbol,
    iconSymbol,
    name,
    supplyAPY,
    isIsolated,
    aIncentivesData,
    isFrozen,
    isActive,
    isPaused,
  } = reserve

  const canBeEnabledAsCollateral =
    !debtCeiling.isMaxed &&
    reserve.reserveLiquidationThreshold !== "0" &&
    ((!reserve.isIsolated && !user.isInIsolationMode) ||
      user.isolatedReserve?.underlyingAsset === reserve.underlyingAsset ||
      (reserve.isIsolated &&
        user.totalCollateralMarketReferenceCurrency === "0"))

  const disableSwap = !isActive || isPaused || reserve.symbol === "stETH"
  const disableWithdraw = !isActive || isPaused
  const disableSupply = !isActive || isFrozen || isPaused

  return (
    <ListMobileItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueRow
        title={<span>Supply balance</span>}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <Row
        caption={<span>Supply APY</span>}
        align="flex-start"
        captionVariant="description"
        mb={2}
      >
        <IncentivesCard
          value={Number(supplyAPY)}
          incentives={aIncentivesData}
          symbol={symbol}
          variant="secondary14"
        />
      </Row>

      <Row
        caption={<span>Used as collateral</span>}
        align={isIsolated ? "flex-start" : "center"}
        captionVariant="description"
        mb={2}
      >
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() =>
            openCollateralChange(
              underlyingAsset,
              currentMarket,
              reserve.name,
              "dashboard",
              usageAsCollateralEnabledOnUser,
            )
          }
        />
      </Row>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mt: 5,
        }}
      >
        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => openSwap(underlyingAsset)}
            fullWidth
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() =>
              openSupply(
                underlyingAsset,
                currentMarket,
                reserve.name,
                "dashboard",
              )
            }
            fullWidth
          >
            <span>Supply</span>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() =>
            openWithdraw(
              underlyingAsset,
              currentMarket,
              reserve.name,
              "dashboard",
            )
          }
          sx={{ ml: 1.5 }}
          fullWidth
        >
          <span>Withdraw</span>
        </Button>
      </Box>
    </ListMobileItemWrapper>
  )
}
