import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useTranslation } from "react-i18next"
import { useModalContext } from "sections/lending/hooks/useModal"
import { MONEY_MARKET_GIGA_RESERVES } from "sections/lending/ui-config/misc"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { TSuppliedAssetsRow } from "sections/lending/ui/table/supplied-assets/SuppliedAssetsTable.utils"

const RowFooter: React.FC<TSuppliedAssetsRow> = ({
  reserve,
  underlyingAsset,
}) => {
  const { t } = useTranslation()
  const { isActive, isPaused, isFrozen } = reserve

  const disableWithdraw = !isActive || isPaused
  const disableSupply = !isActive || isFrozen || isPaused

  const { openSupply, openGigaSupply, openWithdraw } = useModalContext()

  return (
    <div sx={{ flex: "row", gap: 16 }}>
      <Button
        disabled={disableSupply}
        onClick={() =>
          MONEY_MARKET_GIGA_RESERVES.includes(underlyingAsset)
            ? openGigaSupply(underlyingAsset)
            : openSupply(underlyingAsset)
        }
        fullWidth
        size="small"
      >
        {t("lending.supply")}
      </Button>
      <Button
        disabled={disableWithdraw}
        onClick={() => openWithdraw(underlyingAsset)}
        fullWidth
        size="small"
      >
        {t("lending.withdraw")}
      </Button>
    </div>
  )
}

export const SuppliedAssetsMobileRow: React.FC<Row<TSuppliedAssetsRow>> = ({
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
      cellIds={[
        "underlyingBalanceUSD",
        "supplyAPY",
        "usageAsCollateralEnabledOnUser",
      ]}
      footer={<RowFooter {...original} />}
    />
  )
}
