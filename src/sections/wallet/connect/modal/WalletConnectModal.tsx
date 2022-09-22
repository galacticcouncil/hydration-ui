import { Modal } from "components/Modal/Modal"
import { useTranslation } from "react-i18next"
import { FC, useState } from "react"

import { web3Enable } from "@polkadot/extension-dapp"
import { useMutation } from "@tanstack/react-query"
import { POLKADOT_APP_NAME } from "utils/network"
import { WalletConnectConfirmPending } from "sections/wallet/connect/confirmPending/WalletConnectConfirmPending"
import { WalletConnectProviderSelect } from "sections/wallet/connect/providerSelect/WalletConnectProviderSelect"
import { WalletConnectAccountSelect } from "sections/wallet/connect/accountSelect/WalletConnectAccountSelect"
import { useStore } from "state/store"
import { WalletConnectActiveFooter } from "./WalletConnectActiveFooter"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const WalletConnectModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("translation")
  const [userSelectedProvider, setUserSelectedProvider] =
    useState<"talisman" | "polkadot-js" | null>(null)

  const mutate = useMutation(["web3Enable"], () =>
    web3Enable(POLKADOT_APP_NAME),
  )
  const { account, setAccount } = useStore()

  const activeProvider = userSelectedProvider ?? account?.provider

  const modalProps = userSelectedProvider
    ? mutate.isLoading
      ? { title: "" }
      : { title: t("walletConnect.accountSelect.title") }
    : { title: t("walletConnect.provider.title") }

  return (
    <Modal
      width={460}
      open={isOpen}
      onClose={() => {
        setUserSelectedProvider(null)
        onClose()
      }}
      {...modalProps}
    >
      {activeProvider ? (
        mutate.isLoading ? (
          <WalletConnectConfirmPending provider={activeProvider} />
        ) : (
          <>
            <WalletConnectAccountSelect
              currentAddress={account?.address.toString()}
              provider={activeProvider}
              onSelect={(account) => {
                setUserSelectedProvider(null)
                setAccount(account)
                onClose()
              }}
            />
            <WalletConnectActiveFooter
              account={account}
              provider={activeProvider}
              onLogout={() => {
                setUserSelectedProvider(null)
                setAccount(undefined)
                onClose()
              }}
              onSwitch={() => {
                setUserSelectedProvider(null)
                setAccount(undefined)
              }}
            />
          </>
        )
      ) : (
        <WalletConnectProviderSelect
          onWalletSelect={(provider) => {
            setUserSelectedProvider(provider)
            if (mutate.status !== "success") {
              mutate.mutate()
            }
          }}
        />
      )}
    </Modal>
  )
}
