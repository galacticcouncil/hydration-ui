import { isMobileDevice } from "@galacticcouncil/utils"
import { useMemo } from "react"

import { WALLET_DEEPLINKS } from "@/config/deeplinks"
import { NOVA_WALLET_BLACKLISTED_PROVIDERS } from "@/config/providers"
import { PROVIDERS_BY_WALLET_MODE, WalletMode } from "@/hooks/useWeb3Connect"
import { Wallet } from "@/types/wallet"
import { isNovaWalletApp } from "@/utils"
import { getWallets } from "@/wallets"

enum WalletProviderGroup {
  Installed = "installed",
  Deeplinked = "deeplinked",
  Other = "other",
}

type UseWalletProvidersResult = Record<WalletProviderGroup, Wallet[]>

export const useWalletProviders = (
  mode: WalletMode,
): UseWalletProvidersResult => {
  return useMemo(() => {
    const isInMobileDevice = isMobileDevice()
    const isInNovaWalletApp = isNovaWalletApp()

    const wallets = getWallets()

    const filteredProviders = wallets.filter(({ provider }) => {
      const providers = PROVIDERS_BY_WALLET_MODE[mode]
      return providers.includes(provider)
    })

    const groups = Object.groupBy(filteredProviders, (wallet) => {
      const isBlacklistedInNovaWallet =
        isInNovaWalletApp &&
        NOVA_WALLET_BLACKLISTED_PROVIDERS.includes(wallet.provider)

      switch (true) {
        case isBlacklistedInNovaWallet:
          return WalletProviderGroup.Other
        case wallet.installed:
          return WalletProviderGroup.Installed
        case isInMobileDevice && !!WALLET_DEEPLINKS[wallet.provider]:
          return WalletProviderGroup.Deeplinked
        default:
          return WalletProviderGroup.Other
      }
    })

    return {
      [WalletProviderGroup.Installed]:
        groups?.[WalletProviderGroup.Installed] || [],
      [WalletProviderGroup.Deeplinked]:
        groups?.[WalletProviderGroup.Deeplinked] || [],
      [WalletProviderGroup.Other]: groups?.[WalletProviderGroup.Other] || [],
    }
  }, [mode])
}
