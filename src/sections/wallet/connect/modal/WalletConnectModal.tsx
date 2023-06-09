import { css } from "@emotion/react"
import { WalletType } from "@polkadot-onboard/core"
import { useWallets } from "@polkadot-onboard/react"
import { useNavigate } from "@tanstack/react-location"
import { Modal, ModalScrollableContent } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useState } from "react"
import { useTranslation } from "react-i18next"
import { WalletConnectAccountSelect } from "sections/wallet/connect/accountSelect/WalletConnectAccountSelect"
import { WalletConnectConfirmPending } from "sections/wallet/connect/confirmPending/WalletConnectConfirmPending"
import { WalletConnectProviderSelect } from "sections/wallet/connect/providerSelect/WalletConnectProviderSelect"
import { externalWallet, useAccountStore } from "state/store"
import { ExternalWalletConnectModal } from "./ExternalWalletConnectModal"
import { WalletConnectActiveFooter } from "./WalletConnectActiveFooter"
import { useEnableWallet } from "./WalletConnectModal.utils"

type Props = { isOpen: boolean; onClose: () => void }

export const WalletConnectModal = ({ isOpen, onClose }: Props) => {
  const { t } = useTranslation()
  const [userSelectedProvider, setUserSelectedProvider] = useState<
    string | null
  >(null)

  const enableWallet = useEnableWallet({
    provider: userSelectedProvider,
    onError: () => setUserSelectedProvider(null),
  })

  const { account, setAccount } = useAccountStore()
  const navigate = useNavigate()
  const activeProvider = userSelectedProvider ?? account?.provider

  const { page, direction, paginateTo } = useModalPagination(
    activeProvider ? 2 : 0,
  )
  const showFooter = activeProvider && page === 2

  const onModalClose = () => {
    setUserSelectedProvider(null)
    onClose()
  }

  const { wallets } = useWallets()
  const wcWallet = wallets?.find((w) => w.type === WalletType.WALLET_CONNECT)
  const [isWCConnecting, setIsWCConnecting] = useState(false)

  const onWalletConnect = async () => {
    setIsWCConnecting(true)

    setUserSelectedProvider("WalletConnect")
    paginateTo(2)
    await wcWallet?.connect()

    setIsWCConnecting(false)
  }

  const isConnecting = enableWallet.isLoading || isWCConnecting

  return (
    <Modal
      open={isOpen}
      disableCloseOutside
      onClose={onModalClose}
      css={css`
        --wallet-footer-height: 96px;
      `}
    >
      <ModalContents
        page={page}
        direction={direction}
        onBack={() => paginateTo(0)}
        onClose={onModalClose}
        contents={[
          {
            title: t("walletConnect.provider.title"),
            content: (
              <ModalScrollableContent
                content={
                  <WalletConnectProviderSelect
                    onWalletSelect={(wallet) => {
                      setUserSelectedProvider(wallet.extensionName)
                      enableWallet.mutate(wallet)
                      paginateTo(2)
                    }}
                    onExternalWallet={() => paginateTo(1)}
                    onWalletConnect={onWalletConnect}
                  />
                }
              />
            ),
          },
          {
            title: t("walletConnect.provider.title"),
            content: (
              <ExternalWalletConnectModal
                onClose={onClose}
                onSelect={() => paginateTo(2)}
              />
            ),
          },
          {
            title: t("walletConnect.accountSelect.title"),
            content:
              activeProvider &&
              (activeProvider !== externalWallet.provider && isConnecting ? (
                <WalletConnectConfirmPending provider={activeProvider} />
              ) : (
                <ModalScrollableContent
                  content={
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
                  }
                />
              )),
          },
        ]}
      />
      {showFooter && (
        <WalletConnectActiveFooter
          account={account}
          provider={activeProvider}
          onLogout={() => {
            setUserSelectedProvider(null)
            setAccount(undefined)
            wcWallet?.disconnect()
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
