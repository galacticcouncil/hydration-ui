import { isEvmAccount } from "@galacticcouncil/sdk"
import {
  isH160Address,
  isSS58Address,
  safeConvertSS58toH160,
} from "@galacticcouncil/utils"
import { useEffect, useRef, useState } from "react"
import { useMount, usePrevious } from "react-use"
import { pick } from "remeda"
import { useShallow } from "zustand/shallow"

import { WalletProviderType } from "@/config/providers"
import { useWeb3Connect } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { toStoredAccount } from "@/utils"
import { ExternalWallet, getWallet } from "@/wallets"
import { BaseSubstrateWallet } from "@/wallets/BaseSubstrateWallet"

export const useWeb3EagerEnable = () => {
  const { enable, disconnect } = useWeb3Enable()
  const { providers, setAccount } = useWeb3Connect(
    useShallow(pick(["providers", "setAccount"])),
  )
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

        if (wallet instanceof ExternalWallet) {
          if (account?.provider === WalletProviderType.ExternalWallet) {
            wallet.setAccount(
              isEvmAccount(account.address)
                ? safeConvertSS58toH160(account.address)
                : account.address,
            )
            await enable(wallet.provider)
          } else {
            disconnect(wallet.provider)
          }
        } else {
          if (wallet?.installed && !wallet?.enabled) {
            await enable(wallet.provider)
            if (account && wallet instanceof BaseSubstrateWallet) {
              wallet.setSigner(account.address)
            }
          }
        }
      }
    }
  }, [providersRequested, enable, disconnect])

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
    const address = params.get("address")

    // Override connected account to ExternalWallet if address is provided in query param
    if (address && (isH160Address(address) || isSS58Address(address))) {
      const externalWallet = getWallet(WalletProviderType.ExternalWallet)
      if (externalWallet instanceof ExternalWallet) {
        externalWallet.setAccount(address)
        enable(WalletProviderType.ExternalWallet).then(([account]) => {
          setAccount(toStoredAccount(account))
        })
      }
    }
  }, [enable, setAccount])
}
