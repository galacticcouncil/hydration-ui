import { Row } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { FC } from "react"
import { useTranslation } from "react-i18next"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useModalContext } from "sections/lending/hooks/useModal"
import { PRIME_ASSET_ADDRESS } from "sections/lending/ui-config/misc"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { getSupplyGigaRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetTable.styled"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"

export const SupplyGigaAssetMobileRow: FC<Row<ComputedReserveData>> = ({
  getVisibleCells,
  original,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { name, symbol, iconSymbol, underlyingAsset } = original
  const { openGigaSupply, openSupply } = useModalContext()

  const cells = getVisibleCells()

  return (
    <MobileRow
      css={getSupplyGigaRowGradient(180)}
      name={name}
      symbol={symbol}
      iconSymbol={iconSymbol}
      detailsAddress={underlyingAsset}
      cells={cells}
      cellIds={["supplyAPY", "usageAsCollateralEnabled"]}
      footer={
        <Button
          onClick={() => {
            if (PRIME_ASSET_ADDRESS === underlyingAsset) {
              openSupply(underlyingAsset)
            } else {
              openGigaSupply(underlyingAsset)
            }
          }}
          fullWidth
          size="small"
          disabled={!account}
        >
          {t("lending.supply")}
        </Button>
      }
    />
  )
}
