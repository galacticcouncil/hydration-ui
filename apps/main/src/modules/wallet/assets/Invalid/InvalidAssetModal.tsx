import {
  Box,
  Flex,
  LinkTextButton,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { FC } from "react"
import { useTranslation } from "react-i18next"

import { AssetLabelFull } from "@/components"
import { InvalidAssetAction } from "@/modules/wallet/assets/Invalid/InvalidAssetAction"
import { InvalidAssetDataPreview } from "@/modules/wallet/assets/Invalid/InvalidAssetDataPreview"
import { InvalidAssetDataPreviewList } from "@/modules/wallet/assets/Invalid/InvalidAssetDataPreviewList"
import { SInvalidAssetHeader } from "@/modules/wallet/assets/Invalid/InvalidAssetModal.styled"
import { useAssets } from "@/providers/assetsProvider"

type Props = {
  readonly assetId: string
  readonly origin: string
  readonly isOpen: boolean
  readonly onClose: () => void
}

export const InvalidAssetModal: FC<Props> = ({
  assetId,
  origin,
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation("wallet")
  const { getAsset } = useAssets()

  const asset = getAsset(assetId)

  return (
    <Modal open={isOpen} onOpenChange={onClose}>
      <ModalHeader
        sx={{ pb: 4 }}
        title={t("invalidAsset.modal.title")}
        customHeader={
          <>
            <Box pt={20} />
            <Flex direction="column" gap={12}>
              <SInvalidAssetHeader>
                {asset && <AssetLabelFull size="large" asset={asset} />}
                <LinkTextButton href="">
                  {t("invalidAsset.modal.checkOnChain", {
                    origin,
                  })}
                </LinkTextButton>
              </SInvalidAssetHeader>
              <Text fs={12} lh={1.2} fw={500} color={getToken("text.medium")}>
                {t("invalidAsset.modal.dataPreview")}
              </Text>
            </Flex>
          </>
        }
      />
      <ModalBody sx={{ pt: 8, pb: 0 }}>
        <InvalidAssetDataPreview assetId={assetId} />
        <ModalContentDivider />
        <InvalidAssetDataPreviewList assetId={assetId} />
        <InvalidAssetAction />
      </ModalBody>
    </Modal>
  )
}
