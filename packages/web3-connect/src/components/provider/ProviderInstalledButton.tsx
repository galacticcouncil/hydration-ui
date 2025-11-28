import { countBy, pick, prop } from "remeda"
import { useShallow } from "zustand/shallow"

import { ProviderButton } from "@/components/provider/ProviderButton"
import { Web3ConnectModalPage } from "@/config/modal"
import { useWeb3ConnectContext } from "@/context/Web3ConnectContext"
import { useWeb3Connect, WalletProviderStatus } from "@/hooks/useWeb3Connect"
import { useWeb3Enable } from "@/hooks/useWeb3Enable"
import { WalletData } from "@/types/wallet"

export const ProviderInstalledButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & WalletData
> = (props) => {
  const { provider } = props
  const { isControlled, setPage } = useWeb3ConnectContext()
  const { enable, disconnect } = useWeb3Enable()

  const { getStatus, accounts } = useWeb3Connect(
    useShallow(pick(["accounts", "getStatus"])),
  )

  const isConnected = getStatus(provider) === WalletProviderStatus.Connected
  const accountCount = countBy(accounts, prop("provider"))[provider] || 0

  const actionProps = (() => {
    if (isControlled) {
      return {
        actionLabel: "Continue",
        onClick: () =>
          isConnected
            ? setPage(Web3ConnectModalPage.AccountSelect)
            : enable(provider),
      }
    }
    if (isConnected) {
      return {
        actionLabel: "Disconnect",
        onClick: () => disconnect(provider),
      }
    }
    return {
      actionLabel: "Continue",
      onClick: () => enable(provider),
    }
  })()

  return (
    <ProviderButton
      {...props}
      {...actionProps}
      isConnected={isConnected}
      accountCount={accountCount}
    />
  )
}
