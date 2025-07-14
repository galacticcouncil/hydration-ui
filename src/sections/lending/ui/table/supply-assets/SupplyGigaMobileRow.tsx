import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useReactTable } from "hooks/useReactTable"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { getSupplyGigaRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigaRow.styled"
import { MoneyMarketAPY } from "sections/pools/stablepool/components/GigaIncentives"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { getAssetIdFromAddress } from "utils/evm"

const columnHelper = createColumnHelper<{}>()

type Props = {
  readonly onOpenSupply: () => void
  readonly reserve: ComputedReserveData
}

export const SupplyGigadotMobileRow: FC<Props> = ({
  onOpenSupply,
  reserve,
}) => {
  const { t } = useTranslation()
  const { account } = useAccount()

  const assetId = getAssetIdFromAddress(reserve.underlyingAsset)

  const table = useReactTable({
    data: useMemo(() => [{}], []),
    columns: useMemo(
      () => [
        columnHelper.display({
          header: t("lending.apy"),
          meta: {
            sx: {
              textAlign: "center",
            },
          },
          cell: () => <MoneyMarketAPY type="supply" assetId={assetId} />,
        }),
      ],
      [t, assetId],
    ),
  })

  return table.getRowModel().rows.map((row) => (
    <MobileRow
      key={row.id}
      css={getSupplyGigaRowGradient(180)}
      name={reserve.name}
      symbol={reserve.symbol}
      iconSymbol={reserve.symbol}
      detailsAddress={reserve.underlyingAsset}
      cells={row.getVisibleCells()}
      cellIds={["supplyAPY"]}
      footer={
        <Button
          onClick={onOpenSupply}
          fullWidth
          size="small"
          disabled={!account}
        >
          {t("lending.supply")}
        </Button>
      }
    />
  ))
}
