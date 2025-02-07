import { useEffect, useRef } from "react"
import { useMount, usePrevious } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWallet } from "@/wallets"

export const useWeb3EagerEnable = () => {
  const { enable } = useWeb3Enable()
  const { providers } = useWeb3Connect(useShallow(pick(["providers"])))
  const prevProviders = usePrevious(providers)

  const hasTriedEagerEnable = useRef(false)

  useMount(() => {
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
      for (const { type } of providers) {
        console.log("Eager enable", type)
        const wallet = getWallet(type)
        if (wallet?.installed && !wallet?.extension) {
          await enable(wallet.provider)
        }
      }
    }
  })

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
