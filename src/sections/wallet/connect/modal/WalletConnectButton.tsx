import { WalletConnectModal } from "./WalletConnectModal"
import { SLoginButton } from "./WalletConnectButton.styled"
import React, { useState } from "react"
import { useTranslation } from "react-i18next"
import { ButtonProps } from "components/Button/Button"

export const WalletConnectButton: React.FC<ButtonProps> = ({ ...props }) => {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation("translation")

  return (
    <>
      <SLoginButton variant="gradient" onClick={() => setOpen(true)} {...props}>
        {t("header.walletConnect.button")}
      </SLoginButton>
      <WalletConnectModal isOpen={open} onClose={() => setOpen(false)} />
    </>
  )
}
