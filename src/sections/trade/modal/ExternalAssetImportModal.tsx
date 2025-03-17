import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useShallow } from "hooks/useShallow"
import { useEffect, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  TExternalAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { AddTokenFormModal } from "sections/wallet/addToken/modal/AddTokenFormModal"
import { useExternalAssetsMetadata, useSettingsStore } from "state/store"
import { isNotNil } from "utils/helpers"
import { TExternal, useAssets } from "providers/assets"

type Props = {
  assetIds: string[]
  onClose?: () => void
}

export const ExternalAssetImportModal: React.FC<Props> = ({
  assetIds = [],
  onClose,
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { externalInvalid, getAssets } = useAssets()
  const { isAdded } = useUserExternalTokenStore()
  const { page, direction, paginateTo } = useModalPagination()
  const degenMode = useSettingsStore(useShallow((s) => s.degenMode))

  const assetsMeta = (getAssets(assetIds) as TExternal[]).filter(
    ({ id, externalId }) => {
      const isChainStored = externalInvalid.some((asset) => asset.id === id)
      const isUserStored = degenMode || isAdded(externalId)
      return isChainStored && !isUserStored
    },
  )

  const getExternalAssetMetadata = useExternalAssetsMetadata(
    useShallow((state) => state.getExternalAssetMetadata),
  )

  const assetsToAddRef = useRef<TExternalAsset[]>([])

  const onCloseHandler = () => {
    setIsOpen(false)
    onClose?.()
  }

  useEffect(() => {
    const assetsToAdd = assetsMeta
      .map(({ parachainId, externalId }) => {
        if (!parachainId || !externalId) return null

        return getExternalAssetMetadata(parachainId, externalId)
      })
      .filter(isNotNil)

    if (assetsToAdd.length > 0 && assetsToAddRef.current.length === 0) {
      assetsToAddRef.current = assetsToAdd
      setIsOpen(true)
    }
  }, [assetsMeta, isAdded, getExternalAssetMetadata])

  return (
    <Modal open={isOpen} disableCloseOutside={true} onClose={onCloseHandler}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={onCloseHandler}
        contents={assetsToAddRef.current.map((asset, index) => ({
          title: t("wallet.assets.table.addToken"),
          headerVariant: "GeistMono",
          content: (
            <AddTokenFormModal
              asset={asset}
              onClose={() => {
                if (index === assetsToAddRef.current.length - 1) {
                  onCloseHandler()
                } else {
                  paginateTo(index + 1)
                }
              }}
            />
          ),
        }))}
      />
    </Modal>
  )
}
