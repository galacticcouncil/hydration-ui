import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { Web3ConnectButtonProps } from "@galacticcouncil/web3-connect/src/components/Web3ConnectButton"
import { useMatch } from "@tanstack/react-router"
import { FC } from "react"

export const AuthorizedAction: FC<Web3ConnectButtonProps> = ({
  children,
  ...props
}) => {
  const { account } = useAccount()

  const isCrossChainPage = !!useMatch({
    from: "/cross-chain/",
    shouldThrow: false,
  })

  // allow incompatible accounts on cross-chain page
  const isIncompatible = !isCrossChainPage && !!account?.isIncompatible

  if (!account || isIncompatible) {
    return <Web3ConnectButton {...props} />
  }

  return children
}
