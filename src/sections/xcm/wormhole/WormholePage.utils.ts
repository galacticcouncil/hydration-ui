import {
  AnyChain,
  EvmChain,
  Parachain,
  SolanaChain,
} from "@galacticcouncil/xcm-core"
import { TransferApi } from "api/wormhole/transfers"
import { useMemo } from "react"
import { removeTrailingSlash } from "utils/formatting"

export const getExplorerAccountLink = (
  chain: AnyChain,
  address: string,
): string => {
  const explorer = chain?.explorer
  if (!explorer) return ""

  return `${removeTrailingSlash(explorer)}/address/${address}`
}

export const getChainId = (chain: AnyChain) => {
  if (chain instanceof SolanaChain) {
    return chain.id
  }
  if (chain instanceof EvmChain) {
    return chain.evmChain.id
  }
  if (chain instanceof Parachain) {
    return chain.parachainId
  }
}

export const useWormholeTransfersApi = () => {
  return useMemo(() => new TransferApi(), [])
}
