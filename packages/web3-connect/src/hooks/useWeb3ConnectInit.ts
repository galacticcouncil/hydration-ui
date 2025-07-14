import { useEffect, useState } from "react"

import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { useWeb3EagerEnable } from "@/hooks/useWeb3EagerEnable"

export const useWeb3ConnectInit = () => {
  useWeb3EagerEnable()

  const [page, setPage] = useState<Web3ConnectModalPage>(
    Web3ConnectModalPage.ProviderSelect,
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
