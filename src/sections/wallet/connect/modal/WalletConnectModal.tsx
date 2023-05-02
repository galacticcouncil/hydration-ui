import { css } from "@emotion/react"
import { Wallet } from "@talismn/connect-wallets"
import { useNavigate } from "@tanstack/react-location"
import { useMutation } from "@tanstack/react-query"
import { Modal } from "components/Modal/Modal"
import { FC, useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletConnectAccountSelect } from "sections/wallet/connect/accountSelect/WalletConnectAccountSelect"
import { WalletConnectConfirmPending } from "sections/wallet/connect/confirmPending/WalletConnectConfirmPending"
import { WalletConnectProviderSelect } from "sections/wallet/connect/providerSelect/WalletConnectProviderSelect"
import { externalWallet, useAccountStore } from "state/store"
import { POLKADOT_APP_NAME } from "utils/api"
import { WalletConnectActiveFooter } from "./WalletConnectActiveFooter"

type Props = {
  isOpen: boolean
  onClose: () => void
}

export const WalletConnectModal: FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation("translation")
  const [userSelectedProvider, setUserSelectedProvider] = useState<
    string | null
  >(null)

  const mutate = useMutation(
    ["web3Enable", userSelectedProvider],
    async (wallet: Wallet) => wallet.enable(POLKADOT_APP_NAME),
    { onError: () => setUserSelectedProvider(null) },
  )

  const { account, setAccount } = useAccountStore()
  const navigate = useNavigate()
  const activeProvider = userSelectedProvider ?? account?.provider

  const modalProps = userSelectedProvider
    ? mutate.isLoading
      ? { title: "" }
      : { title: t("walletConnect.accountSelect.title") }
    : { title: t("walletConnect.provider.title") }

  return (
    <Modal
      open={isOpen}
      onClose={() => {
        setUserSelectedProvider(null)
        onClose()
      }}
      css={css`
        --wallet-select-footer-height: 96px;
        ${activeProvider &&
        "padding-bottom: var(--wallet-select-footer-height);"}
      `}
      {...modalProps}
    >
      {activeProvider ? (
        activeProvider !== externalWallet.provider && mutate.isLoading ? (
          <WalletConnectConfirmPending provider={activeProvider} />
        ) : (
          <>
            <WalletConnectAccountSelect
              currentAddress={account?.address.toString()}
              provider={activeProvider}
              onClose={onClose}
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
                navigate({
                  search: undefined,
                  fromCurrent: true,
                })
              }}
              onSwitch={() => {
                navigate({
                  search: undefined,
                  fromCurrent: true,
                })
                setUserSelectedProvider(null)
                setAccount(undefined)
              }}
            />
          </>
        )
      ) : (
        <WalletConnectProviderSelect
          onWalletSelect={(wallet) => {
            setUserSelectedProvider(wallet.extensionName)
            mutate.mutate(wallet)
          }}
          onClose={onClose}
        />
      )}
    </Modal>
  )
}
