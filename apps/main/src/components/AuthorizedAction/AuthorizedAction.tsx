import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { Web3ConnectButtonProps } from "@galacticcouncil/web3-connect/src/components/Web3ConnectButton"
import { FC } from "react"

export const AuthorizedAction: FC<Web3ConnectButtonProps> = ({
  children,
  ...props
}) => {
  const { account } = useAccount()

  if (account?.canUseOnHydration) return children

  return <Web3ConnectButton {...props} requiresHydrationAccount />
}
