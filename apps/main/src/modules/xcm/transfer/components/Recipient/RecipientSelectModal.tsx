import { isAddressValidOnChain } from "@galacticcouncil/utils"
import { Account } from "@galacticcouncil/web3-connect"
import { getWallet } from "@galacticcouncil/web3-connect/src/wallets"
import { useState } from "react"
import { useFormContext } from "react-hook-form"

import { ConnectChainTile } from "@/modules/xcm/transfer/components/ConnectButton/ConnectChainTile"
import {
  RecipientConnectModal,
  RecipientConnectTile,
  RecipientModal,
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
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false)
  const { watch } = useFormContext<XcmFormValues>()

  const destChain = watch("destChain")
  const destAccount = watch("destAccount")
  const destWallet = destAccount?.provider
    ? getWallet(destAccount.provider)
    : null

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
      <RecipientModal
        open={open}
        onClose={onClose}
        destinationWallet={
          destAccount ? (
            <RecipientConnectTile
              account={destAccount}
              walletLogoSrc={destWallet?.logo}
              onSelect={onClose}
              onConnect={() => setIsConnectModalOpen(true)}
            />
          ) : (
            <ConnectChainTile
              chain={destChain}
              onConnect={() => setIsConnectModalOpen(true)}
            />
          )
        }
        customAddress={
          destChain
            ? {
                chainName: destChain.name,
                isValidAddress: (address) =>
                  isAddressValidOnChain(address, destChain),
              }
            : undefined
        }
        onSubmitAddress={handleCustomAddressSubmit}
      />
      <RecipientConnectModal
        open={isConnectModalOpen}
        destChain={destChain}
        onOpenChange={setIsConnectModalOpen}
        onAccountSelect={handleAccountSelect}
      />
    </>
  )
}
