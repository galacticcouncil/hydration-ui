import { useEffect, useState } from "react"
import { prop } from "remeda"

import { Web3ConnectModalPage } from "@/config/modal"
import {
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"

const getInitialPage = (mode: WalletMode) => {
  const { getConnectedProviders, accounts } = useWeb3Connect.getState()

  const connectedProviders = getConnectedProviders(mode)
  const connectedProviderTypes = connectedProviders.map(prop("type"))

  const connectedAccounts = accounts.filter((account) =>
    connectedProviderTypes.includes(account.provider),
  )

  if (connectedAccounts.length > 0) {
    return Web3ConnectModalPage.AccountSelect
  }

  return Web3ConnectModalPage.ProviderSelect
}

export const useWeb3ConnectInit = ({ mode }: { mode: WalletMode }) => {
  const [page, setPage] = useState<Web3ConnectModalPage>(() =>
    getInitialPage(mode),
  )

  useEffect(() => {
    return useWeb3Connect.subscribe(
      ({ recentProvider, error, getStatus, providers }) => {
        const status = getStatus(recentProvider)

        const isConnected = status === WalletProviderStatus.Connected
        const isDisconnected = status === WalletProviderStatus.Disconnected
        const isPending = status === WalletProviderStatus.Pending
        const isError = status === WalletProviderStatus.Error

        const hasConnectedProviders = providers.length > 0

        if (isError && error) {
          return setPage(Web3ConnectModalPage.Error)
        }

        if (isConnected || isPending) {
          return setPage(Web3ConnectModalPage.AccountSelect)
        }

        if (isDisconnected && !hasConnectedProviders) {
          return setPage(Web3ConnectModalPage.ProviderSelect)
        }
      },
    )
  }, [setPage])

  return { page, setPage }
}
