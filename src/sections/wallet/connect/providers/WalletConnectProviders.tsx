import { getWallets, Wallet } from "@talismn/connect-wallets"
import { useMedia } from "react-use"
import { WalletConnectProvidersButton } from "sections/wallet/connect/providers/button/WalletConnectProvidersButton"
import { theme } from "theme"
import { getWalletMeta } from "sections/wallet/connect/modal/WalletConnectModal.utils"
import { WalletConnectWCButton } from "./button/WalletConnectWCButton"

type Props = {
  onConnect: (provider: Wallet) => void
  onDownload: (provider: { installUrl: string }) => void
  onWalletConnect: () => void
}

export const WalletConnectProviders = ({
  onConnect,
  onDownload,
  onWalletConnect,
}: Props) => {
  const wallets = getWallets()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isNovaWallet = window.walletExtension?.isNovaWallet || !isDesktop

  return (
    <div sx={{ flex: "column", align: "stretch", mt: 8, gap: 8 }}>
      {wallets.map((wallet) => (
        <WalletConnectProvidersButton
          key={wallet.extensionName}
          wallet={wallet}
          isNovaWallet={isNovaWallet}
          onClick={() => {
            if (wallet.installed) {
              onConnect(wallet)
            } else {
              const walletMeta = getWalletMeta(wallet, isNovaWallet)
              if (walletMeta) onDownload(walletMeta)
            }
          }}
          isInjected={!!wallet.installed}
        />
      ))}
      {import.meta.env.VITE_FF_WALLET_CONNECT === "true" && (
        <WalletConnectWCButton key="WalletConnect" onClick={onWalletConnect} />
      )}
    </div>
  )
}
