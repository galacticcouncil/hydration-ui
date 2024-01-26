import { ReactNode } from "react"
import { BorrowDisabledToolTip } from "sections/lending/components/infoTooltips/BorrowDisabledToolTip"
import { OffboardingTooltip } from "sections/lending/components/infoTooltips/OffboardingToolTip"
import { PausedTooltip } from "sections/lending/components/infoTooltips/PausedTooltip"
import { StETHCollateralToolTip } from "sections/lending/components/infoTooltips/StETHCollateralToolTip"
import { AssetsBeingOffboarded } from "sections/lending/components/Warnings/OffboardingWarning"
import { CustomMarket } from "sections/lending/ui-config/marketsConfig"

import { AMPLToolTip } from "sections/lending/components/infoTooltips/AMPLToolTip"
import { FrozenTooltip } from "sections/lending/components/infoTooltips/FrozenTooltip"
import { RenFILToolTip } from "sections/lending/components/infoTooltips/RenFILToolTip"
import { ListMobileItem } from "sections/lending/components/lists/ListMobileItem"

// These are all optional due to MobileListItemLoader
interface ListMobileItemWrapperProps {
  symbol?: string
  iconSymbol?: string
  name?: string
  underlyingAsset?: string
  children: ReactNode
  loading?: boolean
  currentMarket?: CustomMarket
  frozen?: boolean
  paused?: boolean
  borrowEnabled?: boolean
  showSupplyCapTooltips?: boolean
  showBorrowCapTooltips?: boolean
  showDebtCeilingTooltips?: boolean
  isIsolated?: boolean
}

export const ListMobileItemWrapper = ({
  symbol,
  iconSymbol,
  name,
  children,
  underlyingAsset,
  loading,
  currentMarket,
  frozen,
  paused,
  borrowEnabled = true,
  showSupplyCapTooltips = false,
  showBorrowCapTooltips = false,
  showDebtCeilingTooltips = false,
  isIsolated = false,
}: ListMobileItemWrapperProps) => {
  const WarningComponent: React.FC = () => {
    const showFrozenTooltip = frozen && symbol !== "renFIL"
    const showRenFilTooltip = frozen && symbol === "renFIL"
    const showAmplTooltip = !frozen && symbol === "AMPL"
    const showstETHTooltip = symbol === "stETH"
    const offboardingDiscussion =
      currentMarket && symbol
        ? AssetsBeingOffboarded[currentMarket]?.[symbol]
        : ""
    const showBorrowDisabledTooltip = !frozen && !borrowEnabled
    return (
      <>
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
        {showBorrowDisabledTooltip && symbol && currentMarket && (
          <BorrowDisabledToolTip
            symbol={symbol}
            currentMarket={currentMarket}
          />
        )}
      </>
    )
  }

  return (
    <ListMobileItem
      isIsolated={isIsolated}
      symbol={symbol}
      iconSymbol={iconSymbol}
      name={name}
      underlyingAsset={underlyingAsset}
      warningComponent={<WarningComponent />}
      loading={loading}
      currentMarket={currentMarket}
      showSupplyCapTooltips={showSupplyCapTooltips}
      showBorrowCapTooltips={showBorrowCapTooltips}
      showDebtCeilingTooltips={showDebtCeilingTooltips}
    >
      {children}
    </ListMobileItem>
  )
}
