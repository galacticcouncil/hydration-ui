import { h160 } from "@galacticcouncil/common"
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

const { isEvmAccount } = h160

export const useWeb3EagerEnable = (enabled = true) => {
  const { enable, disconnect } = useWeb3Enable()
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
        if (!wallet) continue

        const isExternal = wallet instanceof ExternalWallet
        const isSubstrate = wallet instanceof BaseSubstrateWallet
        const isExternalConnected =
          account?.provider === WalletProviderType.ExternalWallet

        if (isExternal && !isExternalConnected) {
          disconnect(wallet.provider)
          continue
        }

        if (isExternal && account) {
          const address = isEvmAccount(account.address)
            ? safeConvertSS58toH160(account.address)
            : account.address

          if (!wallet.account) {
            wallet.setAccount(address)
            await enable(wallet.provider)
          }

          continue
        }

        if (wallet.installed && !wallet.enabled) {
          await enable(wallet.provider)

          if (isSubstrate && account) {
            wallet.setSigner(account.address)
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
