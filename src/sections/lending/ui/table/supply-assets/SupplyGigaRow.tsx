import { FC, useState } from "react"
import { ComputedReserveData } from "sections/lending/hooks/app-data-provider/useAppDataProvider"
import { useMedia } from "react-use"
import { theme } from "theme"
import { SupplyGigadotMobileRow } from "sections/lending/ui/table/supply-assets/SupplyGigaMobileRow"
import { SupplyGigadotDesktopRow } from "sections/lending/ui/table/supply-assets/SupplyGigaDesktopRow"
import { getAssetIdFromAddress } from "utils/evm"
import { REVERSE_A_TOKEN_UNDERLYING_ID_MAP } from "sections/lending/ui-config/aTokens"
import { SupplyAssetModal } from "./SupplyAssetModal"
import { Modal } from "components/Modal/Modal"
import { DialogTitle } from "@radix-ui/react-dialog"

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
  const [supplyModal, setSupplyModal] = useState("")

  const assetId =
    REVERSE_A_TOKEN_UNDERLYING_ID_MAP[
      getAssetIdFromAddress(reserve.underlyingAsset)
    ]

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
