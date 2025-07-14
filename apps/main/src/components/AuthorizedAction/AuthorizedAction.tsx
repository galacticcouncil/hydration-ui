import { useAccount, Web3ConnectButton } from "@galacticcouncil/web3-connect"
import { Web3ConnectButtonProps } from "@galacticcouncil/web3-connect/src/components/Web3ConnectButton"
import { FC, ReactNode } from "react"

type Props = {
  readonly children: ReactNode
  readonly size?: Web3ConnectButtonProps["size"]
}

export const AuthorizedAction: FC<Props> = ({ children, size }) => {
  const { account } = useAccount()

  if (!account) {
    return <Web3ConnectButton size={size} />
  }

  return children
}
