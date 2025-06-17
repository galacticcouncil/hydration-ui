import { countBy, pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { ProviderButton } from "@/components/provider/ProviderButton"
import { Web3ConnectModalPage } from "@/config/modal"
import { WalletProviderType } from "@/config/providers"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { getWallet, getWalletData } from "@/wallets"

export const ProviderExternalButton = () => {
  const { setPage } = useWeb3ConnectContext()
  const { disconnect } = useWeb3Enable()

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const provider = WalletProviderType.ExternalWallet
  const wallet = getWallet(provider)

  if (!wallet) return null

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected
  const accountCount = countBy(accounts, prop("provider"))[provider] || 0

  const walletData = getWalletData(wallet)

  return (
    <ProviderButton
      {...walletData}
      onClick={() => {
        if (isConnected) {
          disconnect(provider)
        } else {
          setPage(Web3ConnectModalPage.ExternalWallet)
        }
      }}
      isConnected={isConnected}
      accountCount={accountCount}
    />
  )
}
