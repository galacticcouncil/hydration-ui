import {
  Box,
  CollapsibleContent,
  CollapsibleRoot,
  Modal,
  ModalBody,
  ModalContentDivider,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { useState } from "react"
import { useTranslation } from "react-i18next"

import { RecipientCustomAddressForm } from "@/modules/xcm/transfer/components/Recipient"

export type RecipientModalProps = {
  open: boolean
  onClose: () => void
  /** The destination chain's wallet, left out where it has none to connect. */
  destinationWallet?: React.ReactNode
  /** Takes a pasted or saved address, valid as the chain decides. */
  customAddress?: {
    chainName: string
    isValidAddress: (address: string) => boolean
  }
  onSubmitAddress: (address: string) => void
}

export const RecipientModal: React.FC<RecipientModalProps> = ({
  open,
  onClose,
  destinationWallet,
  customAddress,
  onSubmitAddress,
}) => {
  const { t } = useTranslation("xcm")
  const [isUsingCustomAddress, setIsUsingCustomAddress] = useState(false)

  return (
    <Modal
      variant="popup"
      open={open}
      onOpenChange={onClose}
      disableInteractOutside
    >
      <ModalHeader title={t("recipient.modal.title")} align="center" />
      <ModalBody sx={{ py: 0 }} scrollable={false}>
        {destinationWallet && (
          <CollapsibleRoot open={!isUsingCustomAddress}>
            <CollapsibleContent>
              <Stack gap="base" py="xl">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("recipient.modal.destinationWallet")}
                </Text>
                {destinationWallet}
              </Stack>
            </CollapsibleContent>
          </CollapsibleRoot>
        )}
        {customAddress && (
          <Box pb="var(--modal-content-padding)">
            {destinationWallet && <ModalContentDivider />}
            <RecipientCustomAddressForm
              chainName={customAddress.chainName}
              isValidAddress={customAddress.isValidAddress}
              onSubmit={onSubmitAddress}
              onChange={(address) => setIsUsingCustomAddress(!!address.trim())}
            />
          </Box>
        )}
      </ModalBody>
    </Modal>
  )
}
