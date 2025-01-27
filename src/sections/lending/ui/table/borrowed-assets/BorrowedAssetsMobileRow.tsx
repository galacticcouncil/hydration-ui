import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { getAssetCapData } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { TBorrowedAssetsRow } from "sections/lending/ui/table/borrowed-assets/BorrowedAssetsTable.utils"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"

const RowFooter: React.FC<TBorrowedAssetsRow> = ({
  reserve,
  underlyingAsset,
  borrowRateMode,
}) => {
  const { t } = useTranslation()
  const { isActive, isPaused, isFrozen, borrowingEnabled } = reserve

  const { openBorrow, openRepay } = useModalContext()

  const { borrowCap } = getAssetCapData(reserve)

  const disableBorrow =
    !isActive || !borrowingEnabled || isFrozen || isPaused || borrowCap.isMaxed

  const disableRepay = !isActive || isPaused

  return (
    <div sx={{ flex: "row", gap: 16 }}>
      <Button
        disabled={disableBorrow}
        onClick={() => openBorrow(underlyingAsset)}
        fullWidth
        size="small"
      >
        {t("lending.borrow")}
      </Button>
      <Button
        disabled={disableRepay}
        onClick={() => openRepay(underlyingAsset, borrowRateMode, isFrozen)}
        fullWidth
        size="small"
      >
        {t("lending.repay")}
      </Button>
    </div>
  )
}

export const BorrowedAssetsMobileRow: React.FC<Row<TBorrowedAssetsRow>> = ({
  getVisibleCells,
  original,
}) => {
  const { reserve, underlyingAsset } = original
  const { name, symbol, iconSymbol } = reserve
  const cells = getVisibleCells()

  return (
    <MobileRow
      name={name}
      symbol={symbol}
      iconSymbol={iconSymbol}
      detailsAddress={underlyingAsset}
      cells={cells}
      cellIds={["totalBorrowsUSD", "borrowAPY", "borrowRateMode"]}
      footer={<RowFooter {...original} />}
    />
  )
}
