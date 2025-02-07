import { useEffect, useState } from "react"
import { useMount } from "react-use"

import { Web3ConnectModalPage } from "@/config/modal"
import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { useWeb3EagerEnable } from "@/hooks/useWeb3EagerEnable"

export const useWeb3ConnectInit = () => {
  useWeb3EagerEnable()

  useMount(() => {
    window.dispatchEvent(new Event("eip6963:requestProvider"))
  })

  const [page, setPage] = useState<Web3ConnectModalPage>(
    Web3ConnectModalPage.ProviderSelect,
  )

  useEffect(() => {
    return useWeb3Connect.subscribe(({ recentProvider, error, getStatus }) => {
      const ixExternalProvider =
        recentProvider === WalletProviderType.ExternalWallet

      const status = getStatus(recentProvider)

      const isConnected = status === "connected"
      const isDisconnected = status === "disconnected"
      const isPending = status === "pending"
      const isError = status === "error"

      if (isError && error) {
        return setPage(Web3ConnectModalPage.Error)
      }

      if (ixExternalProvider) {
        return setPage(Web3ConnectModalPage.External)
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
