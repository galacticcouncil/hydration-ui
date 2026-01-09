import { Account, useAccount } from "@galacticcouncil/web3-connect"
import { useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { ConnectButton } from "@/modules/xcm/transfer/components/ConnectButton"
import { RecipientSelectModal } from "@/modules/xcm/transfer/components/Recipient"
import { XcmFormValues } from "@/modules/xcm/transfer/hooks/useXcmFormSchema"

type RecipientSelectButtonProps = {
  value?: string
  onChange: (address: string, account?: Account) => void
}

export const RecipientSelectButton: React.FC<RecipientSelectButtonProps> = ({
  value,
  onChange,
}) => {
  const { isConnected } = useAccount()
  const { t } = useTranslation("xcm")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { watch } = useFormContext<XcmFormValues>()
  const destAccount = watch("destAccount")

  return (
    <>
      {isConnected && (
        <ConnectButton
          walletProvider={destAccount?.provider}
          placeholder={t("recipient.button.selectRecipient")}
          address={value}
          onClick={() => setIsModalOpen(true)}
        />
      )}
      <RecipientSelectModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectAddress={(address, account) => {
          onChange(address, account)
          setIsModalOpen(false)
        }}
      />
    </>
  )
}
