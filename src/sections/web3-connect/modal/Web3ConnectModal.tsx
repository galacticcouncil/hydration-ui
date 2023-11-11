import { css } from "@emotion/react"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { ModalContents } from "components/Modal/contents/ModalContents"
import { useEffect } from "react"
import { useTranslation } from "react-i18next"
import {
  WalletProviderType,
  useProviderAccounts,
} from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectAccounts } from "sections/web3-connect/accounts/Web3ConnectAccounts"
import { Web3ConnectErrorModal } from "sections/web3-connect/modal/Web3ConnectErrorModal"
import { Web3ConnectExternalModal } from "sections/web3-connect/modal/Web3ConnectExternalModal"
import { Web3ConnectFooter } from "sections/web3-connect/modal/Web3ConnectFooter"
import { Web3ConnectProviderPending } from "sections/web3-connect/providers/Web3ConnectProviderPending"
import { Web3ConnectProviders } from "sections/web3-connect/providers/Web3ConnectProviders"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"

enum ModalPage {
  ProviderSelect,
  AccountSelect,
  External,
  Error,
}

export const Web3ConnectModal = () => {
  const { t } = useTranslation()

  const {
    provider: activeProvider,
    status,
    disconnect,
    open,
    toggle,
    error,
  } = useWeb3ConnectStore()
  const { data: accounts, isLoading } = useProviderAccounts(activeProvider)

  const initialPage = activeProvider
    ? ModalPage.AccountSelect
    : ModalPage.ProviderSelect

  const { page, direction, paginateTo } = useModalPagination(initialPage)

  useEffect(() => {
    return useWeb3ConnectStore.subscribe(({ status, provider, error }) => {
      const ixExternalProvider = provider === WalletProviderType.ExternalWallet

      const isConnected = status === "connected"
      const isDisconnected = status === "disconnected"
      const isPending = status === "pending"
      const isError = status === "error"

      if (isError && error) {
        return paginateTo(ModalPage.Error)
      }

      if (ixExternalProvider) {
        return paginateTo(ModalPage.External)
      }

      if (isConnected || isPending) {
        return paginateTo(ModalPage.AccountSelect)
      }

      if (isDisconnected) {
        return paginateTo(ModalPage.ProviderSelect)
      }
    })
  }, [paginateTo])

  const isConnecting = isLoading || status === "pending"
  const showFooter = activeProvider && page === ModalPage.AccountSelect

  return (
    <Modal
      open={open}
      disableCloseOutside
      onClose={toggle}
      css={css`
        --wallet-footer-height: 96px;
      `}
    >
      <ModalContents
        page={page}
        direction={direction}
        onBack={() => paginateTo(0)}
        onClose={toggle}
        contents={[
          {
            title: t("walletConnect.provider.title"),
            content: <Web3ConnectProviders />,
          },
          {
            title: t("walletConnect.accountSelect.title"),
            content:
              activeProvider && isConnecting ? (
                <Web3ConnectProviderPending provider={activeProvider} />
              ) : (
                <Web3ConnectAccounts accounts={accounts} />
              ),
          },
          {
            title: t("walletConnect.provider.title"),
            content: (
              <Web3ConnectExternalModal
                onClose={toggle}
                onSelect={() => paginateTo(ModalPage.AccountSelect)}
              />
            ),
          },
          {
            title: t("walletConnect.provider.title"),
            content: (
              <Web3ConnectErrorModal
                message={error}
                onRetry={() => {
                  disconnect()
                  paginateTo(ModalPage.ProviderSelect)
                }}
              />
            ),
          },
        ]}
      />
      {showFooter && (
        <Web3ConnectFooter
          onSwitch={() => {
            disconnect()
            paginateTo(0)
          }}
          onLogout={() => {
            disconnect()
            toggle()
          }}
        />
      )}
    </Modal>
  )
}
