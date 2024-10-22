import { Spinner } from "components/Spinner/Spinner"
import { FC } from "react"
import { WalletProviderType } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectWalletLoader } from "sections/web3-connect/modal/Web3ConnectWalletLoader"
import { Maybe } from "utils/helpers"

type Props = { provider: Maybe<WalletProviderType | WalletProviderType[]> }

export const Web3ConnectProviderPending: FC<Props> = ({ provider }) => {
  return (
    <div sx={{ flex: "column", align: "center", px: [0, 20], py: 20 }}>
      {provider ? (
        <Web3ConnectWalletLoader provider={provider} />
      ) : (
        <Spinner size={120} />
      )}
    </div>
  )
}
