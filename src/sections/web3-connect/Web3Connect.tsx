import { useWeb3ConnectEagerEnable } from "sections/web3-connect/Web3Connect.utils"
import { Web3ConnectModal } from "./modal/Web3ConnectModal"
import { useWeb3ConnectStore } from "sections/web3-connect/store/useWeb3ConnectStore"
import { useShallow } from "hooks/useShallow"

export type Web3ConnectProps = {}

export const Web3Connect: React.FC<Web3ConnectProps> = () => {
  useWeb3ConnectEagerEnable()

  const open = useWeb3ConnectStore(useShallow((state) => state.open))

  return <>{open && <Web3ConnectModal />}</>
}
