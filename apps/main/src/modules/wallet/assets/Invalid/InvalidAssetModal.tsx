import {
  Box,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
} from "@galacticcouncil/ui/components"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { InvalidAssetAction } from "@/modules/wallet/assets/Invalid/InvalidAssetAction"
import { InvalidAssetDataPreview } from "@/modules/wallet/assets/Invalid/InvalidAssetDataPreview"
import { InvalidAssetDataPreviewList } from "@/modules/wallet/assets/Invalid/InvalidAssetDataPreviewList"
import { InvalidAssetModalHeader } from "@/modules/wallet/assets/Invalid/InvalidAssetModalHeader"

type Props = {
  readonly assetId: string
  readonly origin: string
}

export const InvalidAssetModal: FC<Props> = ({ assetId, origin }) => {
  const { t } = useTranslation("wallet")

  return (
    <>
      <ModalHeader
        sx={{ pb: 4 }}
        title={t("invalidAsset.modal.title")}
        customHeader={
          <>
            <Box pt={20} />
            <InvalidAssetModalHeader assetId={assetId} origin={origin} />
          </>
        }
      />
      <ModalBody sx={{ pt: 8, pb: 0 }}>
        <InvalidAssetDataPreview assetId={assetId} />
        <ModalContentDivider />
        <InvalidAssetDataPreviewList assetId={assetId} />
        <InvalidAssetAction />
      </ModalBody>
    </>
  )
}
