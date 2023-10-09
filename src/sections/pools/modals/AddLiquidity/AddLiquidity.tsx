import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "sections/assets/AssetsModal"
import { AddLiquidityForm } from "./AddLiquidityForm"
import { useDebounce } from "react-use"

type Props = {
  poolId: u32
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const AddLiquidity = ({ poolId, isOpen, onClose, onSuccess }: Props) => {
  const [assetId, setAssetId] = useState<string>(poolId.toString())
  const { t } = useTranslation()
  const { page, direction, back, next } = useModalPagination()

  return (
    <Modal open={isOpen} disableCloseOutside onClose={onClose}>
      <ModalContents
        disableAnimation
        page={page}
        direction={direction}
        onClose={onClose}
        onBack={back}
        contents={[
          {
            title: t("liquidity.add.modal.title"),
            content: (
              <AddLiquidityForm
                assetId={assetId}
                onSuccess={onSuccess}
                onClose={onClose}
                onAssetOpen={next}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            content: (
              <AssetsModalContent
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  back()
                }}
              />
            ),
            noPadding: true,
            headerVariant: "FontOver",
          },
        ]}
      />
    </Modal>
  )
}
