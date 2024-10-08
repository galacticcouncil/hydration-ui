import { useExternalTokensRugCheck } from "api/external"
import { Modal } from "components/Modal/Modal"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useTranslation } from "react-i18next"
import { AddTokenFormModal } from "sections/wallet/addToken/modal/AddTokenFormModal"

type Props = {
  open: boolean
  assetId: string
  onClose: () => void
}

export const ExternalAssetUpdateModal: React.FC<Props> = ({
  open,
  assetId,
  onClose,
}) => {
  const { t } = useTranslation()

  const rugCheck = useExternalTokensRugCheck([assetId])
  const rugCheckData = rugCheck.tokensMap.get(assetId)
  const asset = rugCheckData?.externalToken

  if (!asset) return null

  return (
    <Modal open={open} disableCloseOutside={true} onClose={onClose}>
      <ModalContents
        onClose={onClose}
        contents={[
          {
            title: rugCheckData?.warnings?.length
              ? t("wallet.assets.table.updateToken")
              : t("wallet.assets.table.assetDetails"),
            headerVariant: "GeistMono",
            content: <AddTokenFormModal asset={asset} onClose={onClose} />,
          },
        ]}
      />
    </Modal>
  )
}
