import { useEvmAccount } from "sections/web3-connect/Web3Connect.utils"
import { useProtocolDataContext } from "./useProtocolDataContext"

export function useIsWrongNetwork(_requiredChainId?: number) {
  const { account } = useEvmAccount()

  const { currentChainId } = useProtocolDataContext()

  const requiredChainId = _requiredChainId ? _requiredChainId : currentChainId
  const isWrongNetwork = account?.chainId !== requiredChainId

  return {
    isWrongNetwork,
    requiredChainId,
  }
}
