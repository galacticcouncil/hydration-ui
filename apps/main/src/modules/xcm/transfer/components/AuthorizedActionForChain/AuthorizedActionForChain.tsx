import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { Web3ConnectButtonProps } from "@galacticcouncil/web3-connect/src/components/Web3ConnectButton"
import { WalletProviderType } from "@galacticcouncil/web3-connect/src/config/providers"
import { AnyChain } from "@galacticcouncil/xc-core"
import { FC } from "react"

import { getWalletModeByChain } from "@/modules/xcm/transfer/utils/chain"

type Props = Omit<
  Web3ConnectButtonProps,
  "mode" | "allowIncompatibleAccounts"
> & {
  chain: AnyChain | null
}

export const AuthorizedActionForChain: FC<Props> = ({
  children,
  chain,
  ...props
}) => {
  const { account } = useAccount()
  const isViewOnlyAccount =
    account?.provider === WalletProviderType.ExternalWallet

  if (!account) {
    return (
      <Web3ConnectButton
        {...props}
        allowIncompatibleAccounts
        mode={chain ? getWalletModeByChain(chain) : undefined}
      />
    )
  }

  if (isViewOnlyAccount) {
    return (
      <Web3ConnectButton
        {...props}
        allowIncompatibleAccounts
        forceConnectWallet
        mode={chain ? getWalletModeByChain(chain) : undefined}
      />
    )
  }

  return children
}
