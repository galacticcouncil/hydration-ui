import { getWallets, Wallet } from "@talismn/connect-wallets"
import { Button } from "components/Button/Button"
import { useMedia } from "react-use"
import { WalletConnectProvidersButton } from "sections/wallet/connect/providers/button/WalletConnectProvidersButton"
import { theme } from "theme"
import { useWalletConnect } from "utils/walletConnect"
import { getWalletMeta } from "../modal/WalletConnectModal.utils"

type Props = {
  onConnect: (provider: Wallet) => void
  onDownload: (provider: { installUrl: string }) => void
}

export const WalletConnectProviders = ({ onConnect, onDownload }: Props) => {
  const wallets = getWallets()
  const isDesktop = useMedia(theme.viewport.gte.sm)
  const isNovaWallet = window.walletExtension?.isNovaWallet || !isDesktop

  const walletConnect = useWalletConnect()
  const onClick = async () => {
    await walletConnect.connect()
  }

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
      <div
        css={{
          background: "orangered",
          padding: 16,
          border: "1px dashed white",
        }}
      >
        <Button onClick={onClick}>Wallet Connect</Button>
      </div>
    </div>
  )
}
