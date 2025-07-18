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
import { useATokens } from "sections/lending/hooks/useATokens"

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
  const { aTokenReverseMap } = useATokens()
  const [supplyModal, setSupplyModal] = useState("")

  const assetId =
    aTokenReverseMap.get(getAssetIdFromAddress(reserve.underlyingAsset)) ?? ""

  const onClose = () => setSupplyModal("")

  return (
    <>
      {isDesktop ? (
        <SupplyGigadotDesktopRow
          reserve={reserve}
          onOpenSupply={() => setSupplyModal(assetId)}
        />
      ) : (
        <SupplyGigadotMobileRow
          reserve={reserve}
          onOpenSupply={() => setSupplyModal(assetId)}
        />
      )}
      <Modal open={!!supplyModal} onClose={onClose}>
        <DialogTitle />
        {!!supplyModal && (
          <SupplyAssetModal assetId={assetId} onClose={onClose} />
        )}
      </Modal>
    </>
  )
}
