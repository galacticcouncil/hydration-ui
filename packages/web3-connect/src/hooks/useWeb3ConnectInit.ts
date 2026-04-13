import { useEffect, useRef, useState } from "react"
import { prop } from "remeda"

import { Web3ConnectModalPage } from "@/config/modal"
import { useMultisigStore } from "@/hooks/useMultisigStore"
import {
  useWeb3Connect,
  WalletMode,
  WalletProviderStatus,
} from "@/hooks/useWeb3Connect"

const MULTISIG_PAGES: Web3ConnectModalPage[] = [
  Web3ConnectModalPage.MultisigSetup,
  Web3ConnectModalPage.MultisigSignerSelect,
]

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

  // Use a ref to read the current page inside the store subscription
  // without recreating the subscription on every page change.
  const pageRef = useRef(page)
  useEffect(() => {
    pageRef.current = page
  }, [page])

  // Clear multisig active state only when account explicitly changes to null
  // (user disconnects). Track previous value via ref so we only clear on an
  // explicit account → null transition, not on every unrelated state update
  // (e.g. wallet connecting / accounts array loading).
  const prevAccountRef = useRef(useWeb3Connect.getState().account)
  useEffect(() => {
    return useWeb3Connect.subscribe((state) => {
      const prev = prevAccountRef.current
      prevAccountRef.current = state.account
      if (!state.account && prev) {
        useMultisigStore.getState().clear()
      }
    })
  }, [])

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

        // Don't auto-navigate away from multisig setup/signer-select pages
        // when a wallet connects — those pages manage navigation themselves.
        if (MULTISIG_PAGES.includes(pageRef.current)) {
          return
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
