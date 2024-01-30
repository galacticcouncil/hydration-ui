import { Tooltip, Typography } from "@mui/material"
import { ReactNode } from "react"
import { BorrowDisabledToolTip } from "sections/lending/components/infoTooltips/BorrowDisabledToolTip"
import { OffboardingTooltip } from "sections/lending/components/infoTooltips/OffboardingToolTip"
import { PausedTooltip } from "sections/lending/components/infoTooltips/PausedTooltip"
import { StETHCollateralToolTip } from "sections/lending/components/infoTooltips/StETHCollateralToolTip"
import { AssetsBeingOffboarded } from "sections/lending/components/Warnings/OffboardingWarning"
import { useAssetCaps } from "sections/lending/hooks/useAssetCaps"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"
import { DASHBOARD_LIST_COLUMN_WIDTHS } from "sections/lending/utils/dashboardSortUtils"

import { AMPLToolTip } from "sections/lending/components/infoTooltips/AMPLToolTip"
import { FrozenTooltip } from "sections/lending/components/infoTooltips/FrozenTooltip"
import { RenFILToolTip } from "sections/lending/components/infoTooltips/RenFILToolTip"
import { ListColumn } from "sections/lending/components/lists/ListColumn"
import { ListItem } from "sections/lending/components/lists/ListItem"
import { Link, ROUTES } from "sections/lending/components/primitives/Link"
import { TokenIcon } from "sections/lending/components/primitives/TokenIcon"

interface ListItemWrapperProps {
  symbol: string
  iconSymbol: string
  name: string
  detailsAddress: string
  children: ReactNode
  currentMarket: CustomMarket
  frozen?: boolean
  paused?: boolean
  borrowEnabled?: boolean
  showSupplyCapTooltips?: boolean
  showBorrowCapTooltips?: boolean
  showDebtCeilingTooltips?: boolean
}

export const ListItemWrapper = ({
  symbol,
  iconSymbol,
  children,
  name,
  detailsAddress,
  currentMarket,
  frozen,
  paused,
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
  ...rest
}: ListItemWrapperProps) => {
  const { supplyCap, borrowCap, debtCeiling } = useAssetCaps()

  const showFrozenTooltip = frozen && symbol !== "renFIL" && symbol !== "BUSD"
  const showRenFilTooltip = frozen && symbol === "renFIL"
  const showAmplTooltip = !frozen && symbol === "AMPL"
  const showstETHTooltip = symbol === "stETH"
  const offboardingDiscussion = AssetsBeingOffboarded[currentMarket]?.[symbol]
  const showBorrowDisabledTooltip = !frozen && !borrowEnabled

  return (
    <ListItem {...rest}>
      <ListColumn maxWidth={DASHBOARD_LIST_COLUMN_WIDTHS.CELL} isRow>
        <Link
          href={ROUTES.reserveOverview(detailsAddress, currentMarket)}
          noWrap
          sx={{ display: "inline-flex", alignItems: "center" }}
        >
          <TokenIcon symbol={iconSymbol} fontSize="large" />
          <Tooltip title={`${name} (${symbol})`} arrow placement="top">
            <Typography
              variant="subheader1"
              sx={{ ml: 12 }}
              noWrap
              data-cy={`assetName`}
            >
              {symbol}
            </Typography>
          </Tooltip>
        </Link>
        {paused && <PausedTooltip />}
        {showFrozenTooltip && (
          <FrozenTooltip symbol={symbol} currentMarket={currentMarket} />
        )}
        {showRenFilTooltip && <RenFILToolTip />}
        {showAmplTooltip && <AMPLToolTip />}
        {showstETHTooltip && <StETHCollateralToolTip />}
        {offboardingDiscussion && (
          <OffboardingTooltip discussionLink={offboardingDiscussion} />
        )}
        {showBorrowDisabledTooltip && (
          <BorrowDisabledToolTip
            symbol={symbol}
            currentMarket={currentMarket}
          />
        )}
        {showSupplyCapTooltips && supplyCap.displayMaxedTooltip({ supplyCap })}
        {showBorrowCapTooltips && borrowCap.displayMaxedTooltip({ borrowCap })}
        {showDebtCeilingTooltips &&
          debtCeiling.displayMaxedTooltip({ debtCeiling })}
      </ListColumn>
      {children}
    </ListItem>
  )
}
