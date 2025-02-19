import { css } from "@emotion/react"
import { Modal } from "components/Modal/Modal"
import { useModalPagination } from "components/Modal/Modal.utils"
import { useEffect } from "react"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectContent } from "sections/web3-connect/modal/Web3ConnectContent"
import {
  Account,
  useWeb3ConnectStore,
} from "sections/web3-connect/store/useWeb3ConnectStore"
import { proxyAccountName } from "sections/web3-connect/wallets/ExternalWallet"

enum ModalPage {
  ProviderSelect,
  External,
  AccountSelect,
  Error,
  AddressBook,
  Delegates,
}

const getInitialPage = (
  hasActiveProviders: boolean,
  account: Account | null,
) => {
  if (account && account?.provider === "external") {
    if (account.name === proxyAccountName) {
      return ModalPage.Delegates
    } else {
      return ModalPage.ProviderSelect
    }
  }

  if (hasActiveProviders) {
    return ModalPage.AccountSelect
  }

  return ModalPage.ProviderSelect
}

export const Web3ConnectModal = () => {
  const { account, disconnect, open, toggle, getConnectedProviders } =
    useWeb3ConnectStore()

  const initialPage = getInitialPage(
    getConnectedProviders().length > 0,
    account,
  )

  const { page, direction, paginateTo } = useModalPagination(initialPage)

  useEffect(() => {
    return useWeb3ConnectStore.subscribe(
      ({ recentProvider, error, getStatus, account }) => {
        const ixExternalProvider =
          recentProvider === WalletProviderType.ExternalWallet

        const status = getStatus(recentProvider)

        const isConnected = status === "connected"
        const isDisconnected = status === "disconnected"
        const isPending = status === "pending"
        const isError = status === "error"

        if (isError && error) {
          return paginateTo(ModalPage.Error)
        }

        if (ixExternalProvider) {
          if (account && account.name === proxyAccountName) {
            return paginateTo(ModalPage.Delegates)
          }

          return paginateTo(ModalPage.External)
        }

        if (isConnected || isPending) {
          return paginateTo(ModalPage.AccountSelect)
        }

        if (isDisconnected) {
          return paginateTo(ModalPage.ProviderSelect)
        }
      },
    )
  }, [paginateTo])

  const logout = () => {
    disconnect()
    toggle()
  }

  return (
    <Modal
      open={open}
      disableCloseOutside
      onClose={toggle}
      css={css`
        --wallet-footer-height: 96px;
      `}
    >
      <Web3ConnectContent
        page={page}
        direction={direction}
        onBack={() => {
          paginateTo(page === ModalPage.AddressBook ? ModalPage.External : 0)
          if (
            page === ModalPage.External &&
            account?.provider !== WalletProviderType.ExternalWallet
          ) {
            disconnect(WalletProviderType.ExternalWallet)
          }
        }}
        onClose={toggle}
        onSelect={() => paginateTo(ModalPage.AccountSelect)}
        onRetry={() => paginateTo(ModalPage.ProviderSelect)}
        onSwitch={() => paginateTo(ModalPage.ProviderSelect)}
        onLogout={logout}
        onOpenAddressBook={() => paginateTo(ModalPage.AddressBook)}
        onCloseAddressBook={() => paginateTo(ModalPage.External)}
      />
    </Modal>
  )
}
