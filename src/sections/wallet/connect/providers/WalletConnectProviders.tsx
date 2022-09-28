import { Box } from "components/Box/Box"
import { WalletConnectProvidersButton } from "sections/wallet/connect/providers/button/WalletConnectProvidersButton"
import { FC } from "react"
import { getWallets, Wallet } from "@talismn/connect-wallets"

type Props = {
  onConnect: (provider: Wallet) => void
  onDownload: (provider: Wallet) => void
}

export const WalletConnectProviders: FC<Props> = ({
  onConnect,
  onDownload,
}) => {
  const wallets = getWallets()

  return (
    <Box flex column align="stretch" mt={8} gap={8}>
      {wallets.map((wallet) => {
        return (
          <WalletConnectProvidersButton
            key={wallet.extensionName}
            wallet={wallet}
            onClick={() => {
              if (wallet.installed) onConnect(wallet)
              else onDownload(wallet)
            }}
            isInjected={!!wallet.installed}
          />
        )
      })}
    </Box>
  )
}
