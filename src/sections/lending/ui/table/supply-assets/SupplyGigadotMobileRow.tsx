import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useReactTable } from "hooks/useReactTable"
import { useAssets } from "providers/assets"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { FormattedNumber } from "sections/lending/components/primitives/FormattedNumber"
import { NoData } from "sections/lending/components/primitives/NoData"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { SupplyGigadotRowData } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow"
import { getSupplyGigadotRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow.styled"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

const columnHelper = createColumnHelper<SupplyGigadotRowData>()

type Props = {
  readonly data: SupplyGigadotRowData
  readonly onOpenSupply: () => void
}

export const SupplyGigadotMobileRow: FC<Props> = ({ data, onOpenSupply }) => {
  const { t } = useTranslation()
  const { getAssetWithFallback } = useAssets()

  const asset = getAssetWithFallback(GDOT_ERC20_ASSET_ID)

  const table = useReactTable({
    data: useMemo(() => [{ supplyAPY: data.supplyAPY }], [data.supplyAPY]),
    columns: useMemo(
      () => [
        columnHelper.accessor("supplyAPY", {
          header: t("lending.apy"),
          meta: {
            sx: {
              textAlign: "center",
            },
          },
          cell: ({ row }) => {
            const { supplyAPY } = row.original

            return supplyAPY.toString() !== "-1" ? (
              <FormattedNumber value={supplyAPY} percent />
            ) : (
              <NoData />
            )
          },
        }),
      ],
      [t],
    ),
  })

  return table.getRowModel().rows.map((row) => (
    <MobileRow
      key={row.id}
      css={getSupplyGigadotRowGradient(180)}
      name={asset.name}
      symbol={asset.symbol}
      iconSymbol={asset.symbol}
      detailsAddress={getAddressFromAssetId(GDOT_STABLESWAP_ASSET_ID)}
      cells={row.getVisibleCells()}
      cellIds={["supplyAPY"]}
      footer={
        <Button onClick={onOpenSupply} fullWidth size="small">
          {t("lending.buy")}
        </Button>
      }
    />
  ))
}
