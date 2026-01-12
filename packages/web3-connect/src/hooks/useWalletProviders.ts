import { useMemo } from "react"

import { PROVIDERS_BY_WALLET_MODE, WalletMode } from "@/hooks/useWeb3Connect"
import { Wallet } from "@/types/wallet"
import { getWallets } from "@/wallets"

type UseWalletProvidersResult = {
  installed: Wallet[]
  other: Wallet[]
}

export const useWalletProviders = (
  mode: WalletMode,
): UseWalletProvidersResult => {
  return useMemo(() => {
    const wallets = getWallets()

    const filteredProviders = wallets.filter(({ provider }) => {
      const providers = PROVIDERS_BY_WALLET_MODE[mode]
      return providers.includes(provider)
    })

    const groups = Object.groupBy(filteredProviders, (wallet) =>
      wallet?.installed ? "installed" : "other",
    )

    return {
      installed: groups?.installed || [],
      other: groups?.other || [],
    }
  }, [mode])
}
