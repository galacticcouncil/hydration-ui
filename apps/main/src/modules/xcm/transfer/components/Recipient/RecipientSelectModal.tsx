import {
  CollapsibleContent,
  CollapsibleRoot,
  Modal,
  ModalBody,
  ModalHeader,
  Stack,
  Text,
} from "@galacticcouncil/ui/components"
import { getToken } from "@galacticcouncil/ui/utils"
import { Account, useWallet } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import {
  RecipientConnectModal,
  RecipientConnectTile,
  RecipientCustomAddressForm,
} from "@/modules/xcm/transfer/components/Recipient"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type RecipientSelectModalProps = {
  open: boolean
  onClose: () => void
  onSelectAddress: (address: string, account?: Account) => void
}

export const RecipientSelectModal: React.FC<RecipientSelectModalProps> = ({
  open,
  onClose,
  onSelectAddress,
}) => {
  const { t } = useTranslation("xcm")
  const wallet = useWallet()
  const [isUsingCustomAddress, setIsUsingCustomAddress] = useState(false)
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const { watch } = useFormContext<XcmFormValues>()

  const destChain = watch("destChain")
  const destAccount = watch("destAccount")

  const handleCustomAddressSubmit = (address: string) => {
    onSelectAddress(address.trim())
    onClose()
  }

  const handleAccountSelect = (account: Account) => {
    onSelectAddress(account.rawAddress, account)
    setIsConnectModalOpen(false)
  }

  return (
    <>
      <Modal open={open} onOpenChange={onClose}>
        <ModalHeader title={t("recipient.modal.title")} align="center" />
        <ModalBody sx={{ py: 0 }} scrollable={false}>
          <CollapsibleRoot open={!isUsingCustomAddress}>
            <CollapsibleContent>
              <Stack gap="base" py="xl">
                <Text fs="p5" color={getToken("text.medium")}>
                  {t("recipient.modal.destinationWallet")}
                </Text>
                {destAccount ? (
                  <RecipientConnectTile
                    account={destAccount}
                    walletLogoSrc={wallet?.logo}
                    onSelect={onClose}
                    onConnect={() => setIsConnectModalOpen(true)}
                  />
                ) : (
                  <ConnectChainTile
                    p={20}
                    sx={{ bg: getToken("controls.dim.base") }}
                    chain={destChain}
                    onConnect={() => setIsConnectModalOpen(true)}
                  />
                )}
              </Stack>
            </CollapsibleContent>
          </CollapsibleRoot>
        </ModalBody>
        {destChain && (
          <ModalBody sx={{ pt: 0 }}>
            <RecipientCustomAddressForm
              destChain={destChain}
              onSubmit={(address) => handleCustomAddressSubmit(address)}
              onChange={(address) => setIsUsingCustomAddress(!!address.trim())}
            />
          </ModalBody>
        )}
      </Modal>
      <RecipientConnectModal
        open={isConnectModalOpen}
        destChain={destChain}
        onOpenChange={setIsConnectModalOpen}
        onAccountSelect={handleAccountSelect}
      />
    </>
  )
}
