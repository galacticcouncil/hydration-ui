import { useEffect, useRef, useState } from "react"
import { useMount, usePrevious } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWallet } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

export const useWeb3EagerEnable = () => {
  const { enable } = useWeb3Enable()
  const { providers } = useWeb3Connect(useShallow(pick(["providers"])))
  const prevProviders = usePrevious(providers)

  const [providersRequested, setProvidersRequested] = useState(false)
  const hasTriedEagerEnable = useRef(false)

  useMount(() => {
    window.dispatchEvent(new Event("eip6963:requestProvider"))
    setProvidersRequested(true)
  })

  useEffect(() => {
    if (!providersRequested) return

    const state = useWeb3Connect.getState()
    const { providers, account } = state

    if (providers.length > 0) {
      eagerEnable()
      hasTriedEagerEnable.current = true
    } else {
      state.disconnect()
    }

    async function eagerEnable() {
      if (hasTriedEagerEnable.current) return
      for (const { type } of providers) {
        const wallet = getWallet(type)

        if (wallet?.installed && !wallet?.enabled) {
          await enable(wallet.provider)
          if (account && wallet instanceof BaseSubstrateWallet) {
            wallet.setSigner(account.address)
          }
        }
      }
    }
  }, [providersRequested, enable])

  useEffect(() => {
    prevProviders?.forEach(({ type }) => {
      const hasWalletDisconnected = !providers.find((p) => p.type === type)
      const wallet = getWallet(type)
      if (wallet && hasWalletDisconnected) {
        wallet.disconnect()
      }
    })
  }, [prevProviders, providers])
}
