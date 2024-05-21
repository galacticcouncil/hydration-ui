import { useExternalAssetRegistry } from "api/externalAssetRegistry"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useRpcProvider } from "providers/rpcProvider"
import { useEffect, useMemo, useRef, useState } from "react"
import { useTranslation } from "react-i18next"
import {
  TExternalAsset,
  useUserExternalTokenStore,
} from "sections/wallet/addToken/AddToken.utils"
import { AddTokenFormModal } from "sections/wallet/addToken/modal/AddTokenFormModal"
import { isNotNil } from "utils/helpers"

type Props = {
  assetIds: string[]
}

export const ExternalAssetImportModal: React.FC<Props> = ({
  assetIds = [],
}) => {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const { assets } = useRpcProvider()
  const { isAdded } = useUserExternalTokenStore()
  const { page, direction, paginateTo } = useModalPagination()

  const { data, isSuccess } = useExternalAssetRegistry()

  const assetsMeta = assets.getAssets(assetIds)
  const assetsToAddRef = useRef<TExternalAsset[]>([])

  const onClose = () => setIsOpen(false)

  useEffect(() => {
    const assetsToAdd = assetsMeta
      .filter(({ id, generalIndex }) => {
        const isChainStored = assets.external.some((asset) => asset.id === id)
        const isUserStored = isAdded(generalIndex)
        return isChainStored && !isUserStored
      })
      .map(({ parachainId, generalIndex }) => {
        if (!parachainId) return null
        const assets = data?.[+parachainId] ?? []
        return assets.find(({ id }) => id === generalIndex)
      })
      .filter(isNotNil)

    if (
      isSuccess &&
      assetsToAdd.length > 0 &&
      assetsToAddRef.current.length === 0
    ) {
      assetsToAddRef.current = assetsToAdd
      setIsOpen(true)
    }
  }, [isSuccess, assetsMeta, assets.external, isAdded, data])

  return (
    <Modal open={isOpen} disableCloseOutside={true} onClose={onClose}>
      <ModalContents
        page={page}
        direction={direction}
        onClose={onClose}
        contents={assetsToAddRef.current.map((asset, index) => ({
          title: t("wallet.assets.table.addToken"),
          headerVariant: "FontOver",
          content: (
            <AddTokenFormModal
              asset={asset}
              onClose={() => {
                if (index === assetsToAddRef.current.length - 1) {
                  onClose()
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
