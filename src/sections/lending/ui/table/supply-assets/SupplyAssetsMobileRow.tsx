import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { getAssetCapData } from "sections/lending/hooks/useAssetCaps"
import { useModalContext } from "sections/lending/hooks/useModal"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { DashboardReserve } from "sections/lending/utils/dashboard"

const RowFooter: React.FC<DashboardReserve> = ({
  isActive,
  isPaused,
  isFreezed,
  walletBalance,
  reserve,
  underlyingAsset,
}) => {
  const { t } = useTranslation()

  const { openSupply } = useModalContext()

  const { supplyCap } = getAssetCapData(reserve)
  const isMaxCapReached = supplyCap.isMaxed

  const disableSupply =
    !isActive ||
    isPaused ||
    isFreezed ||
    Number(walletBalance ?? 0) <= 0 ||
    isMaxCapReached

  return (
    <Button
      disabled={disableSupply}
      onClick={() => openSupply(underlyingAsset)}
      fullWidth
      size="small"
    >
      {t("lending.supply")}
    </Button>
  )
}

export const SupplyAssetsMobileRow: React.FC<Row<DashboardReserve>> = ({
  getVisibleCells,
  original,
}) => {
  const { name, symbol, iconSymbol, detailsAddress } = original
  const cells = getVisibleCells()

  return (
    <MobileRow
      name={name}
      symbol={symbol}
      iconSymbol={iconSymbol}
      detailsAddress={detailsAddress}
      cells={cells}
      cellIds={[
        "supplyAPY",
        "walletBalanceUSD",
        "usageAsCollateralEnabledOnUser",
      ]}
      footer={<RowFooter {...original} />}
    />
  )
}
