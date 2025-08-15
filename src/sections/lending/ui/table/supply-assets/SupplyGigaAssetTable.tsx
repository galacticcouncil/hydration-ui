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
import { useSupplyGigaAssetsTableColumns } from "sections/lending/ui/table/supply-assets/SupplyAssetsTable.utils"
import { getSupplyGigaRowGradient } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetTable.styled"
import { SupplyGigaAssetMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigaAssetMobileRow"
import { SupplyAssetModal } from "./SupplyAssetModal"
import { Modal } from "components/Modal/Modal"
import { DialogTitle } from "@radix-ui/react-dialog"
import { theme } from "theme"
import { useAssets } from "providers/assets"
import { useCallback, useState } from "react"
import { getAssetIdFromAddress } from "utils/evm"
import { Row } from "@tanstack/react-table"

export type SupplyGigaAssetTableProps = {
  data: ComputedReserveData[]
}

export const SupplyGigaAssetTable: React.FC<SupplyGigaAssetTableProps> = ({
  data,
}) => {
  const navigate = useNavigate()
  const { currentMarket } = useProtocolDataContext()
  const isDesktop = useMedia(theme.viewport.gte.sm)

  const { getRelatedAToken } = useAssets()
  const [supplyModal, setSupplyModal] = useState("")

  const onClose = () => setSupplyModal("")

  const onOpenSupply = useCallback(
    (reserve: ComputedReserveData) => {
      const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
      const aToken = getRelatedAToken(assetId)
      const aTokenId = aToken?.id ?? ""
      setSupplyModal(aTokenId)
    },
    [getRelatedAToken],
  )

  const columns = useSupplyGigaAssetsTableColumns(onOpenSupply)
  const table = useReactTable({
    data,
    columns,
  })

  const renderMobileRow = useCallback(
    (row: Row<ComputedReserveData>) => (
      <SupplyGigaAssetMobileRow {...row} onOpenSupply={onOpenSupply} />
    ),
    [onOpenSupply],
  )

  return (
    <>
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
        renderRow={isDesktop ? undefined : renderMobileRow}
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
      <Modal open={!!supplyModal} onClose={onClose}>
        <DialogTitle />
        {!!supplyModal && (
          <SupplyAssetModal assetId={supplyModal} onClose={onClose} />
        )}
      </Modal>
    </>
  )
}
