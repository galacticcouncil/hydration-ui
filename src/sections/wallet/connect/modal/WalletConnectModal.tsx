import { Wallet } from "@talismn/connect-wallets"
import { useNavigate } from "@tanstack/react-location"
import { useMutation } from "@tanstack/react-query"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
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

  const { page, direction, paginateTo } = useModalPagination()
  const showFooter = activeProvider && page === 1

  const onModalClose = () => {
    setUserSelectedProvider(null)
    onClose()
  }

  return (
    <Modal open={isOpen} onClose={onModalClose}>
      <ModalContents
        page={page}
        direction={direction}
        onBack={() => paginateTo(0)}
        css={{ paddingBottom: showFooter ? 96 : 0 }}
        contents={[
          {
            title: t("walletConnect.provider.title"),
            content: (
              <WalletConnectProviderSelect
                onWalletSelect={(wallet) => {
                  setUserSelectedProvider(wallet.extensionName)
                  mutate.mutate(wallet)
                  paginateTo(1)
                }}
                onClose={onClose}
              />
            ),
          },
          {
            title: t("walletConnect.accountSelect.title"),
            content:
              activeProvider &&
              (activeProvider !== externalWallet.provider &&
              mutate.isLoading ? (
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
                </>
              )),
          },
        ]}
      />
      {activeProvider && page === 1 && (
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
            paginateTo(0)
          }}
        />
      )}
    </Modal>
  )
}
