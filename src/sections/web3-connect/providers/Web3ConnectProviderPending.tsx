import { FC } from "react"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectWalletLoader } from "sections/web3-connect/modal/Web3ConnectWalletLoader"

type Props = { provider: WalletProviderType }

export const Web3ConnectProviderPending: FC<Props> = ({ provider }) => {
  return (
    <div sx={{ flex: "column", align: "center", px: [0, 20], py: 20 }}>
      <Web3ConnectWalletLoader provider={provider} />
    </div>
  )
}
