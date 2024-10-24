import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { useModalContext } from "sections/lending/hooks/useModal"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { DashboardReserve } from "sections/lending/utils/dashboard"

const RowFooter: React.FC<DashboardReserve> = ({
  isFreezed,
  underlyingAsset,
  availableBorrows,
}) => {
  const { t } = useTranslation()

  const { openBorrow } = useModalContext()

  const disableBorrow = isFreezed || Number(availableBorrows) <= 0

  return (
    <Button
      disabled={disableBorrow}
      onClick={() => openBorrow(underlyingAsset)}
      fullWidth
      size="small"
    >
      {t("lending.borrow")}
    </Button>
  )
}

export const BorrowAssetsMobileRow: React.FC<Row<DashboardReserve>> = ({
  getVisibleCells,
  original,
}) => {
  const { name, symbol, iconSymbol, underlyingAsset } = original
  const cells = getVisibleCells()

  return (
    <MobileRow
      name={name}
      symbol={symbol}
      iconSymbol={iconSymbol}
      detailsAddress={underlyingAsset}
      cells={cells}
      cellIds={["availableBorrowsInUSD", "variableBorrowRate"]}
      footer={<RowFooter {...original} />}
    />
  )
}
