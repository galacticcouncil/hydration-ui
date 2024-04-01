import { u32 } from "@polkadot/types"
import { Modal } from "components/Modal/Modal"
import { useCallback, useState } from "react"
import { useTranslation } from "react-i18next"
import { Maybe } from "utils/helpers"
import { AssetsModalContent } from "./AssetsModal"
import { TAsset } from "api/assetDetails"

interface useAssetsModalProps {
  onSelect?: (asset: NonNullable<TAsset>) => void
  allowedAssets?: Maybe<u32 | string>[]
  title?: string
  hideInactiveAssets?: boolean
  allAssets?: boolean
  confirmRequired?: boolean
  defaultSelectedAsssetId?: string
}

export const useAssetsModal = ({
  onSelect,
  allowedAssets,
  title,
  hideInactiveAssets,
  allAssets,
  confirmRequired,
  defaultSelectedAsssetId,
}: useAssetsModalProps) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)

  const openModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const handleSelect = useCallback(
    (asset: NonNullable<TAsset>) => {
      setIsOpen(false)
      onSelect?.(asset)
    },
    [onSelect],
  )

  const modal = isOpen ? (
    <Modal
      open={isOpen}
      onClose={() => setIsOpen(false)}
      onBack={() => setIsOpen(false)}
      title={title || t("selectAsset.title")}
      headerVariant="FontOver"
      noPadding
      disableCloseOutside
    >
      <AssetsModalContent
        onSelect={handleSelect}
        allowedAssets={allowedAssets}
        hideInactiveAssets={hideInactiveAssets}
        allAssets={allAssets}
        confirmRequired={confirmRequired}
        defaultSelectedAsssetId={defaultSelectedAsssetId}
      />
    </Modal>
  ) : null

  return {
    openModal,
    modal,
    isOpen,
  }
}
