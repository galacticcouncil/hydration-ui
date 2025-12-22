import { useEffect, useState } from "react"

import { Web3ConnectModalPage } from "@/config/modal"
import {
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"

const getInitialPage = (mode: WalletMode) => {
  const { getConnectedProviders } = useWeb3Connect.getState()

  const connectedProviders = getConnectedProviders(mode)

  if (connectedProviders.length > 0) {
    return Web3ConnectModalPage.AccountSelect
  }

  return Web3ConnectModalPage.ProviderSelect
}

export const useWeb3ConnectInit = ({ mode }: { mode: WalletMode }) => {
  const [page, setPage] = useState<Web3ConnectModalPage>(() =>
    getInitialPage(mode),
  )

  useEffect(() => {
    return useWeb3Connect.subscribe(({ recentProvider, error, getStatus }) => {
      const status = getStatus(recentProvider)

      const isConnected = status === WalletProviderStatus.Connected
      const isDisconnected = status === WalletProviderStatus.Disconnected
      const isPending = status === WalletProviderStatus.Pending
      const isError = status === WalletProviderStatus.Error

      if (isError && error) {
        return setPage(Web3ConnectModalPage.Error)
      }

      if (isConnected || isPending) {
        return setPage(Web3ConnectModalPage.AccountSelect)
      }

      if (isDisconnected) {
        return setPage(Web3ConnectModalPage.ProviderSelect)
      }
    })
  }, [setPage])

  return { page, setPage }
}
