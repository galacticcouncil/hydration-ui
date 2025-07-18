import { FC, useState } from "react"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SupplyGigadotMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigaMobileRow"
import { SupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigaDesktopRow"
import { getAssetIdFromAddress } from "utils/evm"
import { SupplyAssetModal } from "./SupplyAssetModal"
import { Modal } from "components/Modal/Modal"
import { DialogTitle } from "@radix-ui/react-dialog"
import { useAssets } from "providers/assets"

export type SupplyGigaRowData = Pick<
  ComputedReserveData,
  "supplyAPY" | "aIncentivesData" | "symbol"
>

type Props = {
  // TODO skeleton
  readonly isLoading: boolean
  readonly reserve: ComputedReserveData
}

export const SupplyGigaRow: FC<Props> = ({ reserve }) => {
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const { getRelatedAToken } = useAssets()
  const [supplyModal, setSupplyModal] = useState("")

  const assetId = getAssetIdFromAddress(reserve.underlyingAsset)
  const aTokenId = getRelatedAToken(assetId)?.id ?? ""

  const onClose = () => setSupplyModal("")

  return (
    <>
      {isDesktop ? (
        <SupplyGigadotDesktopRow
          reserve={reserve}
          onOpenSupply={() => setSupplyModal(aTokenId)}
        />
      ) : (
        <SupplyGigadotMobileRow
          reserve={reserve}
          onOpenSupply={() => setSupplyModal(aTokenId)}
        />
      )}
      <Modal open={!!supplyModal} onClose={onClose}>
        <DialogTitle />
        {!!supplyModal && (
          <SupplyAssetModal assetId={aTokenId} onClose={onClose} />
        )}
      </Modal>
    </>
  )
}
