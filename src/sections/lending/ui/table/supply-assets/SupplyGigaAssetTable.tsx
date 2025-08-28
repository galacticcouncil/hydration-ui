import { css } from "@emotion/react"
import { useNavigate } from "@tanstack/react-location"
import { DataTable } from "components/DataTable"
import { useReactTable } from "hooks/useReactTable"
import { useMedia } from "react-use"
import { ROUTES } from "sections/lending/components/primitives/Link"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useProtocolDataContext } from "sections/lending/hooks/useProtocolDataContext"
import {
  supplyAssetsTableBackground,
  supplyAssetsTableSize,
  supplyAssetsTableSpacing,
} from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.constants"
import { getSupplyGigaRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetTable.styled"
import { SupplyGigaAssetMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetMobileRow"
import { theme } from "theme"
import { useSupplyGigaAssetsTableColumns } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetTable.utils"

export type SupplyGigaAssetTableProps = {
  data: ComputedReserveData[]
}

export const SupplyGigaAssetTable: React.FC<SupplyGigaAssetTableProps> = ({
  data,
}) => {
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const columns = useSupplyGigaAssetsTableColumns()
  const table = useReactTable({
    data,
    columns,
  })

  return (
    <DataTable
      fixedLayout
      css={[
        css`
          --border-color: transparent;
        `,
        { "tbody > tr": getSupplyGigaRowGradient(90) },
      ]}
      table={table}
      spacing={supplyAssetsTableSpacing}
      size={supplyAssetsTableSize}
      background={supplyAssetsTableBackground}
      customContainer
      renderRow={isDesktop ? undefined : SupplyGigaAssetMobileRow}
      hoverable
      onRowClick={(row) => {
        navigate({
          to: ROUTES.reserveOverview(
            row.original.underlyingAsset,
            currentMarket,
          ),
        })
      }}
    />
  )
}
