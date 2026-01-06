import { useMemo } from "react"

import { AccountFilterOption } from "@/components/account/AccountFilter"
import { WalletProviderType } from "@/config/providers"
import { PROVIDERS_BY_WALLET_MODE } from "@/hooks/useWeb3Connect"
import { Wallet } from "@/types/wallet"
import { getWallets } from "@/wallets"

type UseWalletProvidersResult = {
  installed: Wallet[]
  other: Wallet[]
}

export const useWalletProviders = (
  filter: AccountFilterOption,
): UseWalletProvidersResult => {
  return useMemo(() => {
    const wallets = getWallets()

    const filteredProviders = wallets
      .filter(({ provider }) => {
        const providers = PROVIDERS_BY_WALLET_MODE[filter]

        return providers.includes(provider)
      })
      .sort((a, b) => {
        const order = Object.values(WalletProviderType)
        return order.indexOf(a.provider) - order.indexOf(b.provider)
      })

    const groups = Object.groupBy(filteredProviders, (wallet) =>
      wallet?.installed ? "installed" : "other",
    )

    return {
      installed: groups?.installed || [],
      other: groups?.other || [],
    }
  }, [filter])
}
