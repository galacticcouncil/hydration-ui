import { ModalBody, ModalHeader } from "@galacticcouncil/ui/components"
import { FC, useState } from "react"
import { useFormContext } from "react-hook-form"
import { useTranslation } from "react-i18next"

import { AccountsList } from "@/modules/wallet/assets/Withdraw/on-chain/AccountsList"
import { AssetWithdrawFormValues } from "@/modules/wallet/assets/Withdraw/on-chain/AssetWithdrawForm.utils"
import {
  wallets,
  WalletSelector,
} from "@/modules/wallet/assets/Withdraw/on-chain/WalletSelector"

type Props = {
  readonly onBack: () => void
}

export const AccountSelectModal: FC<Props> = ({ onBack }) => {
  const { t } = useTranslation(["wallet"])
  const { formState, setValue } = useFormContext<AssetWithdrawFormValues>()
  const [selectedWallet, setSelectedWallet] = useState<string>(wallets[0])

  return (
    <>
      <ModalHeader title={t("withdraw.selectAccount.title")} onBack={onBack} />
      <ModalBody
        sx={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 20 }}
      >
        <WalletSelector
          selectedWallet={selectedWallet}
          onSelect={(wallet) => setSelectedWallet(wallet)}
        />
        <AccountsList
          wallet={selectedWallet}
          onSelect={(address) => {
            setValue("address", address, {
              shouldValidate: formState.isSubmitted,
            })
            onBack()
          }}
        />
      </ModalBody>
    </>
  )
}
