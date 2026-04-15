import {
  Web3ConnectAccountIdentity,
  Web3ConnectAccountIdentityProps,
} from "@galacticcouncil/web3-connect"

import { useRpcProvider } from "@/providers/rpcProvider"

export const AccountIdentity: React.FC<
  Omit<Web3ConnectAccountIdentityProps, "papi">
> = (props) => {
  const { papi } = useRpcProvider()
  return <Web3ConnectAccountIdentity papi={papi} {...props} />
}
