import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { ComponentProps, useState } from 'react'
import { useTranslation } from "react-i18next"
import { AssetsModalContent } from "../../../assets/AssetsModal"
import { RemoveLiquidity } from "./RemoveLiquidity"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  position: ComponentProps<typeof RemoveLiquidity>['position']
}

enum Page {
  REMOVE,
  ASSETS,
}

export const RemoveLiquidityModal = ({
  isOpen,
  onClose,
  onSuccess,
  position,
}: Props) => {
  const { t } = useTranslation()
  const [page, setPage] = useState<Page>(Page.REMOVE)
  // TODO: shouldn't be hardcoded
  const [assetId, setAssetId] = useState<string>("7")

  const handleBack = () => {
    return setPage(Page.REMOVE)
  }

  return (
    <Modal open={isOpen} onClose={onClose} disableCloseOutside={true}>
      <ModalContents
        onClose={onClose}
        page={page}
        onBack={page === Page.ASSETS ? handleBack : undefined}
        contents={[
          {
            title: t("liquidity.remove.modal.title"),
            headerVariant: "gradient",
            content: (
              <RemoveLiquidity
                assetId={assetId}
                onClose={onClose}
                position={position}
                onSuccess={onSuccess}
                onAssetOpen={() => setPage(Page.ASSETS)}
              />
            ),
          },
          {
            title: t("selectAsset.title"),
            headerVariant: "gradient",
            content: (
              <AssetsModalContent
                // hideInactiveAssets={true}
                // allowedAssets={Array.from(assetMetaById?.keys() ?? [])}
                onSelect={(asset) => {
                  setAssetId(asset.id)
                  handleBack()
                }}
              />
            ),
          },
        ]}
      />
    </Modal>
  )
}
