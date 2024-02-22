import { SwitchHorizontalIcon } from "@heroicons/react/outline"
import { EyeIcon } from "@heroicons/react/solid"

import { Button, ListItemText, Menu, MenuItem, SvgIcon } from "@mui/material"
import { useState } from "react"
import { NoData } from "sections/lending/components/primitives/NoData"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { useRootStore } from "sections/lending/store/root"
import { DashboardReserve } from "sections/lending/utils/dashboardSortUtils"
import { isFeatureEnabled } from "sections/lending/utils/marketsAndNetworksConfig"

import { CapsHint } from "sections/lending/components/caps/CapsHint"
import { CapType } from "sections/lending/components/caps/helper"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { ListAPRColumn } from "sections/lending/modules/dashboard/lists/ListAPRColumn"
import { ListButtonsColumn } from "sections/lending/modules/dashboard/lists/ListButtonsColumn"
import { ListItemCanBeCollateral } from "sections/lending/modules/dashboard/lists/ListItemCanBeCollateral"
import { ListItemWrapper } from "sections/lending/modules/dashboard/lists/ListItemWrapper"
import { ListValueColumn } from "sections/lending/modules/dashboard/lists/ListValueColumn"

export const SupplyAssetsListItem = ({
  symbol,
  iconSymbol,
  name,
  walletBalance,
  walletBalanceUSD,
  supplyCap,
  totalLiquidity,
  supplyAPY,
  aIncentivesData,
  underlyingAsset,
  isActive,
  isFreezed,
  isIsolated,
  usageAsCollateralEnabledOnUser,
  detailsAddress,
  isPaused,
}: DashboardReserve) => {
  const currentMarketData = useRootStore((store) => store.currentMarketData)
  const currentMarket = useRootStore((store) => store.currentMarket)
  const { openSupply, openSwitch } = useModalContext()

  // Disable the asset to prevent it from being supplied if supply cap has been reached
  const { supplyCap: supplyCapUsage, debtCeiling } = useAssetCaps()
  const isMaxCapReached = supplyCapUsage.isMaxed

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const disableSupply =
    !isActive ||
    isPaused ||
    isFreezed ||
    Number(walletBalance) <= 0 ||
    isMaxCapReached

  const onDetailsClick = () => {
    setAnchorEl(null)
  }

  const handleSwitchClick = () => {
    openSwitch(underlyingAsset)
    setAnchorEl(null)
  }

  return (
    <ListItemWrapper
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      detailsAddress={detailsAddress}
      data-cy={`dashboardSupplyListItem_${symbol.toUpperCase()}`}
      currentMarket={currentMarket}
      showDebtCeilingTooltips
    >
      <ListValueColumn
        symbol={symbol}
        value={Number(walletBalance)}
        subValue={walletBalanceUSD}
        withTooltip={false}
        disabled={Number(walletBalance) === 0 || isMaxCapReached}
        capsComponent={
          <CapsHint
            capType={CapType.supplyCap}
            capAmount={supplyCap}
            totalAmount={totalLiquidity}
            withoutText
          />
        }
      />

      <ListAPRColumn
        value={Number(supplyAPY)}
        incentives={aIncentivesData}
        symbol={symbol}
      />

      <ListColumn>
        {debtCeiling.isMaxed ? (
          <NoData />
        ) : (
          <ListItemCanBeCollateral
            isIsolated={isIsolated}
            usageAsCollateralEnabled={usageAsCollateralEnabledOnUser}
          />
        )}
      </ListColumn>

      <ListButtonsColumn>
        <Button
          disabled={disableSupply}
          variant="contained"
          onClick={() => {
            openSupply(underlyingAsset)
          }}
        >
          <span>Supply</span>
        </Button>
        <Button
          id="supply-extra-button"
          sx={{
            minWidth: 0,
            px: 16,
          }}
          variant="outlined"
          onClick={handleClick}
          aria-controls={open ? "basic-menu" : undefined}
          aria-haspopup="true"
          aria-expanded={open ? "true" : undefined}
        >
          <span>...</span>
        </Button>
        <Menu
          id="supply-item-extra-menu"
          anchorEl={anchorEl}
          open={open}
          MenuListProps={{
            "aria-labelledby": "supply-extra-button",
            sx: {
              py: 0,
            },
          }}
          onClose={handleClose}
          keepMounted={true}
          PaperProps={{
            sx: {
              minWidth: "120px",
              py: 0,
            },
          }}
        >
          <MenuItem
            sx={{ gap: 2 }}
            onClick={handleSwitchClick}
            disabled={!isFeatureEnabled.switch(currentMarketData)}
          >
            <SvgIcon fontSize="small">
              <SwitchHorizontalIcon />
            </SvgIcon>
            <ListItemText>Switch</ListItemText>
          </MenuItem>
          <MenuItem
            sx={{ gap: 2 }}
            component={Link}
            href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
            onClick={onDetailsClick}
          >
            <SvgIcon fontSize="small">
              <EyeIcon />
            </SvgIcon>
            <ListItemText>Details</ListItemText>
          </MenuItem>
        </Menu>
      </ListButtonsColumn>
    </ListItemWrapper>
  )
}
