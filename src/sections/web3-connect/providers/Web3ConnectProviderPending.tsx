import { FC } from "react"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectWalletLoader } from "sections/web3-connect/modal/Web3ConnectWalletLoader"
import { Web3ConnectWCSelector } from "sections/web3-connect/providers/Web3ConnectWCSelector"

type Props = { provider: WalletProviderType }

export const Web3ConnectProviderPending: FC<Props> = ({ provider }) => {
  const isWalletConnect = provider === WalletProviderType.WalletConnect

  return (
    <div
      sx={{ flex: "column", align: "center" }}
      css={{ paddingBottom: "var(--wallet-footer-height)" }}
    >
      {isWalletConnect ? (
        <Web3ConnectWCSelector />
      ) : (
        <Web3ConnectWalletLoader provider={provider} />
      )}
    </div>
  )
}
