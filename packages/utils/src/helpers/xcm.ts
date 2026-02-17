import {
  AnyChain,
  AnyEvmChain,
  AnyParachain,
  Asset,
  ChainType,
  EvmChain,
  EvmParachain,
  Parachain,
  SolanaChain,
  SuiChain,
} from "@galacticcouncil/xc-core"

import { HYDRATION_CHAIN_KEY } from "../constants"
import {
  safeConvertAddressSS58,
  safeConvertH160toSS58,
  safeConvertSS58toH160,
  safeConvertSS58ToSolanaAddress,
  safeConvertSS58ToSuiAddress,
} from "../helpers"
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

export function isEvmChain(chain: AnyChain): chain is EvmChain {
  return chain.getType() === ChainType.EvmChain
}

export function isSolanaChain(chain: AnyChain): chain is SolanaChain {
  return chain.getType() === ChainType.SolanaChain
}

export function isSuiChain(chain: AnyChain): chain is SuiChain {
  return chain.getType() === ChainType.SuiChain
}

export function isAnyEvmChain(chain: AnyChain): chain is AnyEvmChain {
  return (
    chain.getType() === ChainType.EvmChain ||
    chain.getType() === ChainType.EvmParachain
  )
}

export function formatSourceChainAddress(
  address: string,
  chain: AnyChain,
): string {
  if (chain.isSolana()) {
    return SolanaAddr.isValid(address)
      ? address
      : safeConvertSS58ToSolanaAddress(address)
  }

  if (chain.isSui()) {
    return SuiAddr.isValid(address)
      ? address
      : safeConvertSS58ToSuiAddress(address)
  }

  if (chain.isEvmChain()) {
    return EvmAddr.isValid(address) ? address : safeConvertSS58toH160(address)
  }

  if (isAnyParachain(chain) && chain.usesH160Acc) {
    return EvmAddr.isValid(address) ? address : safeConvertSS58toH160(address)
  }

  if (isAnyParachain(chain) && !chain.usesH160Acc) {
    return EvmAddr.isValid(address)
      ? safeConvertH160toSS58(address)
      : safeConvertAddressSS58(address)
  }

  return safeConvertAddressSS58(address)
}

export function formatDestChainAddress(
  address: string,
  chain: AnyChain,
): string {
  if (chain.key === HYDRATION_CHAIN_KEY && EvmAddr.isValid(address)) {
    return safeConvertH160toSS58(address)
  }
  return address
}
