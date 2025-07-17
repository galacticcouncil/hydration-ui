import { useBreakpoints } from "@galacticcouncil/ui/theme"
import { useMemo } from "react"

import { AccountFilterOption } from "@/components/account/AccountFilter"
import {
  DESKTOP_ONLY_PROVIDERS,
  MOBILE_ONLY_PROVIDERS,
  WalletProviderType,
} from "@/config/providers"
import { PROVIDERS_BY_WALLET_MODE } from "@/hooks/useWeb3Connect"
import { Wallet } from "@/types/wallet"
import { getWallets } from "@/wallets"

export const useWalletProviders = (
  filter: AccountFilterOption,
): [Wallet[], Wallet[]] => {
  const { isDesktop } = useBreakpoints()

  return useMemo(() => {
    const wallets = getWallets()

    const filteredProviders = wallets
      .filter(({ provider }) => {
        const byScreen = isDesktop
          ? !MOBILE_ONLY_PROVIDERS.includes(provider)
          : !DESKTOP_ONLY_PROVIDERS.includes(provider)

        const providers = PROVIDERS_BY_WALLET_MODE[filter]
        const byProvider = providers.includes(provider)

        return byScreen && byProvider
      })
      .sort((a, b) => {
        const order = Object.values(WalletProviderType)
        return order.indexOf(a.provider) - order.indexOf(b.provider)
      })

    const groups = Object.groupBy(filteredProviders, (wallet) =>
      wallet?.installed ? "installed" : "other",
    )

    const installed = groups?.installed || []
    const other = groups?.other || []

    return [installed, other]
  }, [isDesktop, filter])
}
