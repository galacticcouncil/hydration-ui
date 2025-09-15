import { AnyChain, Parachain, EvmChain } from "@galacticcouncil/xcm-core"

export const getChainId = (chain: AnyChain) => {
  switch (true) {
    case chain instanceof EvmChain:
      return chain.evmChain.id
    case chain instanceof Parachain:
      return chain.parachainId
    default:
      return chain.id
  }
}
