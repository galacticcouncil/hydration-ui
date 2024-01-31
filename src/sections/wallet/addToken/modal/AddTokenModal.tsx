import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { TExternalAsset } from "sections/wallet/addToken/AddToken.utils"
import { AddTokenFormModal } from "sections/wallet/addToken/modal/AddTokenFormModal"
import { AddTokenListModal } from "sections/wallet/addToken/modal/AddTokenListModal"

enum ModalPage {
  List,
  Form,
}

export const AddTokenModal = ({ onClose }: { onClose: () => void }) => {
  const { t } = useTranslation()
  const [selectedAsset, selectedAssetSet] = useState<
    TExternalAsset | undefined
  >()
  const [search, setSearch] = useState("")

  const { page, direction, paginateTo } = useModalPagination(ModalPage.List)

  if (selectedAsset && page !== 1) paginateTo(ModalPage.Form)
  if (!selectedAsset && page !== 0) paginateTo(ModalPage.List)

  return (
    <Modal open disableCloseOutside onClose={onClose}>
      <ModalContents
        onClose={onClose}
        page={page}
        direction={direction}
        onBack={() => selectedAssetSet(undefined)}
        contents={[
          {
            noPadding: true,
            content: (
              <AddTokenListModal
                onCustomAssetClick={() => paginateTo(ModalPage.Form)}
                onAssetSelect={(asset) => selectedAssetSet(asset)}
                search={search}
                setSearch={setSearch}
              />
            ),
          },
          {
            title: t("wallet.addToken.header.addCustom"),
            headerVariant: "FontOver",
            content: (
              <AddTokenFormModal asset={selectedAsset} onClose={onClose} />
            ),
          },
        ]}
      />
    </Modal>
  )
}
