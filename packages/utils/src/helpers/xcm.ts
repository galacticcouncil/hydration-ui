import {
  AnyChain,
  AnyEvmChain,
  AnyParachain,
  Asset,
  ChainType,
  EvmParachain,
  Parachain,
} from "@galacticcouncil/xc-core"

import { EvmAddr, SolanaAddr, Ss58Addr, SuiAddr } from "./address"

export function getChainAssetId(chain: AnyChain, asset: Asset) {
  if (chain instanceof Parachain) {
    return chain.getMetadataAssetId(asset) || 0
  }
  return chain.getAssetId(asset)
}

export function getChainId(chain: AnyChain) {
  switch (true) {
    case isAnyParachain(chain):
      return chain.parachainId
    case isAnyEvmChain(chain):
      return chain.evmChain.id
    default:
      return chain.id
  }
}

export function isAddressValidOnChain(address: string, chain: AnyChain) {
  switch (true) {
    case isParachain(chain):
      return chain.usesH160Acc
        ? EvmAddr.isValid(address)
        : Ss58Addr.isValid(address)
    case isEvmParachain(chain):
      return chain.usesH160Acc
        ? EvmAddr.isValid(address)
        : Ss58Addr.isValid(address) || EvmAddr.isValid(address)
    case chain.isEvm():
      return EvmAddr.isValid(address)
    case chain.isSolana():
      return SolanaAddr.isValid(address)
    case chain.isSui():
      return SuiAddr.isValid(address)
    default:
      return false
  }
}

export function isParachain(chain: AnyChain): chain is Parachain {
  return chain.getType() === ChainType.Parachain
}

export function isEvmParachain(chain: AnyChain): chain is EvmParachain {
  return chain.getType() === ChainType.EvmParachain
}

export function isAnyParachain(chain: AnyChain): chain is AnyParachain {
  return (
    chain.getType() === ChainType.Parachain ||
    chain.getType() === ChainType.EvmParachain
  )
}

export function isAnyEvmChain(chain: AnyChain): chain is AnyEvmChain {
  return (
    chain.getType() === ChainType.EvmChain ||
    chain.getType() === ChainType.EvmParachain
  )
}
