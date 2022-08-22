import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { useState } from "react"

import { web3Enable } from "@polkadot/extension-dapp"
import { useMutation } from "@tanstack/react-query"
import { POLKADOT_APP_NAME } from "utils/network"
import { WalletConnectConfirmPending } from "sections/wallet/connect/confirmPending/WalletConnectConfirmPending"
import { WalletConnectProviderSelect } from "sections/wallet/connect/providerSelect/WalletConnectProviderSelect"
import { WalletConnectAccountSelect } from "sections/wallet/connect/accountSelect/WalletConnectAccountSelect"

export function WalletConnectModal(props: {
  isOpen: boolean
  onClose: () => void
}) {
  const { t } = useTranslation("translation")
  const [selectedProvider, setSelectedProvider] =
    useState<"talisman" | "polkadot-js" | null>(null)

  const mutate = useMutation(["web3Enable"], () =>
    web3Enable(POLKADOT_APP_NAME),
  )

  const modalProps = selectedProvider
    ? mutate.isLoading
      ? { title: "" }
      : { title: t("walletConnectModal.accountSelect.title") }
    : { title: t("walletConnectModal.provider.title") }

  return (
    <Modal
      width={460}
      open={props.isOpen}
      onClose={() => {
        setSelectedProvider(null)
        props.onClose()
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
