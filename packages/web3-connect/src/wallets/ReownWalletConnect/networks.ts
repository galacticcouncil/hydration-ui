import {
  HYDRATION_CHAIN_KEY,
  isEvmChain,
  isEvmParachain,
  isParachain,
} from "@galacticcouncil/utils"
import { chainsMap } from "@galacticcouncil/xc-cfg"
import { EvmParachain, Parachain } from "@galacticcouncil/xc-core"

import { defineSubstrateNetwork } from "@/wallets/ReownWalletConnect/utils"

const hydrationChain = chainsMap.get(HYDRATION_CHAIN_KEY) as EvmParachain

export const hydration = defineSubstrateNetwork(hydrationChain)

export const EVM_NETWORKS = [...chainsMap.values()]
  .filter((c) => isEvmChain(c) || isEvmParachain(c))
  .map((c) => c.evmChain)

export const SUBSTRATE_NETWORKS = [...chainsMap.values()]
  .filter((c): c is Parachain | EvmParachain => {
    // Hydration network is handled separately as default
    if (c.key === HYDRATION_CHAIN_KEY) return false

    const isSubstrateParachain = isParachain(c) || isEvmParachain(c)
    return isSubstrateParachain && !c.usesH160Acc
  })
  .map(defineSubstrateNetwork)
