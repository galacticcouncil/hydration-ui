import { WalletConnectProvidersButton } from "sections/wallet/connect/providers/button/WalletConnectProvidersButton"
import { getWallets, Wallet } from "@talismn/connect-wallets"

type Props = {
  onConnect: (provider: Wallet) => void
  onDownload: (provider: Wallet) => void
}

export const WalletConnectProviders = ({ onConnect, onDownload }: Props) => {
  const wallets = getWallets()

  return (
    <div sx={{ flex: "column", align: "stretch", mt: 8, gap: 8 }}>
      {wallets.map((wallet) => (
        <WalletConnectProvidersButton
          key={wallet.extensionName}
          wallet={wallet}
          onClick={() => {
            if (wallet.installed) onConnect(wallet)
            else onDownload(wallet)
          }}
          isInjected={!!wallet.installed}
        />
      ))}
    </div>
  )
}
