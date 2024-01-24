import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { AddTokenFormModal } from "sections/wallet/addToken/modal/AddTokenFormModal"
import { AddTokenListModal } from "sections/wallet/addToken/modal/AddTokenListModal"

enum ModalPage {
  List,
  Form,
}

export const AddTokenModal = ({ onClose }: { onClose: () => void }) => {
  const [selectedAsset, selectedAssetSet] = useState<
    TExternalAsset | undefined
  >()

  const { page, direction, paginateTo } = useModalPagination(ModalPage.List)

  return (
    <Modal open disableCloseOutside onClose={onClose}>
      <ModalContents
        onClose={onClose}
        page={page}
        direction={direction}
        onBack={() => {
          selectedAssetSet(undefined)
          paginateTo(ModalPage.List)
        }}
        contents={[
          {
            noPadding: true,
            content: (
              <AddTokenListModal
                onCustomAssetClick={() => paginateTo(ModalPage.Form)}
                onAssetSelect={(asset) => {
                  selectedAssetSet(asset)
                  paginateTo(ModalPage.Form)
                }}
              />
            ),
          },
          {
            content: <AddTokenFormModal asset={selectedAsset} />,
          },
        ]}
      />
    </Modal>
  )
}
