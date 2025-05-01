import { createColumnHelper } from "@tanstack/react-table"
import { Button } from "components/Button/Button"
import { useReactTable } from "hooks/useReactTable"
import { useAssets } from "providers/assets"
import { FC, useMemo } from "react"
import { useTranslation } from "react-i18next"
import { MobileRow } from "sections/lending/ui/table/components/MobileRow"
import { getSupplyGigadotRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigadotRow.styled"
import { GDOTAPY } from "sections/pools/stablepool/components/GDOTIncentives"
import { useAccount } from "sections/web3-connect/Web3Connect.utils"
import { GDOT_ERC20_ASSET_ID, GDOT_STABLESWAP_ASSET_ID } from "utils/constants"
import { getAddressFromAssetId } from "utils/evm"

const columnHelper = createColumnHelper<{}>()

type Props = {
  readonly onOpenSupply: () => void
}

export const SupplyGigadotMobileRow: FC<Props> = ({ onOpenSupply }) => {
  const { t } = useTranslation()
  const { account } = useAccount()
  const { getAssetWithFallback } = useAssets()

  const asset = getAssetWithFallback(GDOT_ERC20_ASSET_ID)

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
          cell: () => {
            return <GDOTAPY type="supply" />
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
