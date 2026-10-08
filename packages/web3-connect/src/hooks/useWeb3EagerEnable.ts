import { withTimeout } from "@galacticcouncil/utils"
import { useEffect, useRef, useState } from "react"
import { useMount, usePrevious } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { NEAR_PROVIDERS, WalletProviderType } from "@/config/providers"
import {
  useWeb3Connect,
  WalletProviderStatus,
  WalletRestoreState,
} from "@/hooks/useWeb3Connect"
import { abandonEnable, useWeb3Enable } from "@/hooks/useWeb3Enable"
import { toStoredAccount } from "@/utils"
import { ExternalWallet, getWallet } from "@/wallets"

const RESTORE_TIMEOUT_MS = 10_000

export const useWeb3EagerEnable = (enabled = true) => {
  const { enable, disconnect } = useWeb3Enable()
  const { enable: enableRestore } = useWeb3Enable({ restore: true })
  const { providers, setAccount } = useWeb3Connect(
    useShallow(pick(["providers", "setAccount"])),
  )
  const prevProviders = usePrevious(providers)

  const [providersRequested, setProvidersRequested] = useState(false)
  const hasTriedEagerEnable = useRef(false)

  useMount(() => {
    if (!enabled) return
    window.dispatchEvent(new Event("eip6963:requestProvider"))
    setProvidersRequested(true)
  })

  useEffect(() => {
    if (!providersRequested) return

    const state = useWeb3Connect.getState()
    const { providers } = state

    if (providers.length > 0) {
      eagerEnable()
      hasTriedEagerEnable.current = true
    } else {
      state.disconnect()
    }

    async function eagerEnable() {
      if (hasTriedEagerEnable.current) return

      await Promise.allSettled(
        providers.map(({ type, status }) => restore(type, status)),
      )
    }

    async function restore(
      type: WalletProviderType,
      status: WalletProviderStatus,
    ) {
      const wallet = getWallet(type)

      // Skip external wallet, it is handled separately based on `acocunt` query param
      if (wallet instanceof ExternalWallet) return

      // Restoring a NEAR wallet downloads and runs its code, so one that only
      // filled destinations is dropped, its session reconnecting without a
      // prompt; one holding the account is restored, as it signs
      if (NEAR_PROVIDERS.includes(type) && state.account?.provider !== type) {
        return disconnect(type)
      }

      if (!wallet || status !== WalletProviderStatus.Connected) {
        return disconnect(type)
      }

      if (!wallet.installed) {
        return disconnect(type)
      }

      if (wallet.enabled) return

      try {
        // Restore success also sets the substrate signer, see `useWeb3Enable`.
        await withTimeout(enableRestore(wallet.provider), RESTORE_TIMEOUT_MS)
      } catch (error) {
        // A real rejection already disconnected the provider in
        // `useWeb3Enable`'s restore mode. Here we only handle our own limit,
        // and only while this restore is still the pending one.
        const isTimeout =
          error instanceof Error && error.name === "TimeoutError"
        const { restoreStates, setRestoreState } = useWeb3Connect.getState()
        if (isTimeout && restoreStates[type] === WalletRestoreState.Restoring) {
          abandonEnable(type)
          setRestoreState(type, WalletRestoreState.Unavailable)
        }
      }
    }
  }, [providersRequested, enableRestore, disconnect])

  useEffect(() => {
    prevProviders?.forEach(({ type }) => {
      const hasWalletDisconnected = !providers.find((p) => p.type === type)
      const wallet = getWallet(type)
      if (wallet && hasWalletDisconnected) {
        wallet.disconnect()
      }
    })
  }, [prevProviders, providers])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const address = params.get("account")

    if (!address) return

    const wallet = getWallet(WalletProviderType.ExternalWallet)

    const isExternalWallet = wallet instanceof ExternalWallet
    if (!isExternalWallet) return

    const isValid = wallet.setAccount(address)
    if (!isValid) return

    enable(WalletProviderType.ExternalWallet).then(([account]) => {
      setAccount(toStoredAccount(account))
    })
  }, [enable, setAccount])
}
