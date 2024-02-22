import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { getAssetCapData } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { TBorrowedAssetsRow } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable.utils"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"

export const BorrowedAssetsMobileRow: React.FC<Row<TBorrowedAssetsRow>> = ({
  getVisibleCells,
  original,
}) => {
  const { reserve, underlyingAsset, borrowRateMode } = original
  const {
    name,
    symbol,
    iconSymbol,
    isActive,
    isPaused,
    isFrozen,
    borrowingEnabled,
  } = reserve
  const cells = getVisibleCells()

  const { openBorrow, openRepay } = useModalContext()

  const { borrowCap } = getAssetCapData(reserve)

  const disableBorrow =
    !isActive || !borrowingEnabled || isFrozen || isPaused || borrowCap.isMaxed

  const disableRepay = !isActive || isPaused

  return (
    <MobileRow
      name={name}
      symbol={symbol}
      iconSymbol={iconSymbol}
      detailsAddress={underlyingAsset}
      cells={cells}
      cellIds={["totalBorrowsUSD", "borrowAPY", "borrowRateMode"]}
      footer={
        <div sx={{ flex: "row", gap: 16 }}>
          <Button
            disabled={disableBorrow}
            onClick={() => openBorrow(underlyingAsset)}
            fullWidth
            size="small"
          >
            Borrow
          </Button>
          <Button
            disabled={disableRepay}
            onClick={() => openRepay(underlyingAsset, borrowRateMode, isFrozen)}
            fullWidth
            size="small"
          >
            Repay
          </Button>
        </div>
      }
    />
  )
}
