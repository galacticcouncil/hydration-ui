import { Button } from "@mui/material"
import { useAppDataContext } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"

import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"
import { ListAPRColumn } from "sections/lending/modules/dashboard/lists/ListAPRColumn"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListItemUsedAsCollateral } from "sections/lending/modules/dashboard/lists/ListItemUsedAsCollateral"
import { ListItemWrapper } from "sections/lending/modules/dashboard/lists/ListItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"

export const SuppliedPositionsListItem = ({
  reserve,
  underlyingBalance,
  underlyingBalanceUSD,
  usageAsCollateralEnabledOnUser,
  underlyingAsset,
}: DashboardReserve) => {
  const { user } = useAppDataContext()
  const { isIsolated, aIncentivesData, isFrozen, isActive, isPaused } = reserve
  const { currentMarketData, currentMarket } = useProtocolDataContext()
  const { openSupply, openWithdraw, openCollateralChange, openSwap } =
    useModalContext()
  const { debtCeiling } = useAssetCaps()
  const isSwapButton = isFeatureEnabled.liquiditySwap(currentMarketData)

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
    <ListItemWrapper
      symbol={reserve.symbol}
      iconSymbol={reserve.iconSymbol}
      name={reserve.name}
      detailsAddress={underlyingAsset}
      currentMarket={currentMarket}
      frozen={reserve.isFrozen}
      paused={isPaused}
      data-cy={`dashboardSuppliedListItem_${reserve.symbol.toUpperCase()}_${
        canBeEnabledAsCollateral && usageAsCollateralEnabledOnUser
          ? "Collateral"
          : "NoCollateral"
      }`}
      showSupplyCapTooltips
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={reserve.iconSymbol}
        value={Number(underlyingBalance)}
        subValue={Number(underlyingBalanceUSD)}
        disabled={Number(underlyingBalance) === 0}
      />

      <ListAPRColumn
        value={Number(reserve.supplyAPY)}
        incentives={aIncentivesData}
        symbol={reserve.symbol}
      />

      <ListColumn>
        <ListItemUsedAsCollateral
          disabled={reserve.isPaused}
          isIsolated={isIsolated}
          usageAsCollateralEnabledOnUser={usageAsCollateralEnabledOnUser}
          canBeEnabledAsCollateral={canBeEnabledAsCollateral}
          onToggleSwitch={() => {
            openCollateralChange(underlyingAsset)
          }}
          data-cy={`collateralStatus`}
        />
      </ListColumn>

      <ListButtonsColumn>
        {isSwapButton ? (
          <Button
            disabled={disableSwap}
            variant="contained"
            onClick={() => {
              openSwap(underlyingAsset)
            }}
            data-cy={`swapButton`}
          >
            <span>Switch</span>
          </Button>
        ) : (
          <Button
            disabled={disableSupply}
            variant="contained"
            onClick={() => openSupply(underlyingAsset)}
          >
            <span>Supply</span>
          </Button>
        )}
        <Button
          disabled={disableWithdraw}
          variant="outlined"
          onClick={() => {
            openWithdraw(underlyingAsset)
          }}
        >
          <span>Withdraw</span>
        </Button>
      </ListButtonsColumn>
    </ListItemWrapper>
  )
}
