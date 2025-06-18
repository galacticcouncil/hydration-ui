import { openUrl } from "@galacticcouncil/utils"
import { countBy, pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { ProviderButton } from "@/components/provider/ProviderButton"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { WalletData } from "@/types/wallet"

export const ProviderInstalledButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & WalletData
> = (props) => {
  const { provider, installed, installUrl } = props
  const { enable, disconnect } = useWeb3Enable()

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected
  const accountCount = countBy(accounts, prop("provider"))[provider] || 0

  return (
    <ProviderButton
      {...props}
      onClick={() => {
        if (isConnected) {
          disconnect(provider)
        } else if (installed) {
          enable(provider)
        } else {
          openUrl(installUrl)
        }
      }}
      isConnected={isConnected}
      accountCount={accountCount}
    />
  )
}
