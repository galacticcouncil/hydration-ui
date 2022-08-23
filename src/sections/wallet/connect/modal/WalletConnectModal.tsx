import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { FC, useState } from "react"

import { web3Enable } from "@polkadot/extension-dapp"
import { useMutation } from "@tanstack/react-query"
import { POLKADOT_APP_NAME } from "utils/network"
import { WalletConnectConfirmPending } from "sections/wallet/connect/confirmPending/WalletConnectConfirmPending"
import { WalletConnectProviderSelect } from "sections/wallet/connect/providerSelect/WalletConnectProviderSelect"
import { WalletConnectAccountSelect } from "sections/wallet/connect/accountSelect/WalletConnectAccountSelect"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const WalletConnectModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("translation")
  const [selectedProvider, setSelectedProvider] =
    useState<"talisman" | "polkadot-js" | null>(null)

  const mutate = useMutation(["web3Enable"], () =>
    web3Enable(POLKADOT_APP_NAME),
  )

  const modalProps = selectedProvider
    ? mutate.isLoading
      ? { title: "" }
      : { title: t("walletConnect.accountSelect.title") }
    : { title: t("walletConnect.provider.title") }

  return (
    <Modal
      width={460}
      open={isOpen}
      onClose={() => {
        setSelectedProvider(null)
        onClose()
      }}
      {...modalProps}
    >
      {selectedProvider ? (
        mutate.isLoading ? (
          <WalletConnectConfirmPending provider={selectedProvider} />
        ) : (
          <WalletConnectAccountSelect provider={selectedProvider} />
        )
      ) : (
        <WalletConnectProviderSelect
          onWalletSelect={(provider) => {
            setSelectedProvider(provider)
            if (mutate.status !== "success") {
              mutate.mutate()
            }
          }}
        />
      )}
    </Modal>
  )
}
