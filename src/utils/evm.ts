import { encodeAddress, decodeAddress } from "@polkadot/util-crypto"
import { Buffer } from "buffer"
import { HYDRA_ADDRESS_PREFIX } from "utils/api"

import {
  isAddress as isEvmAddress,
  getAddress as getEvmAddress,
} from "@ethersproject/address"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { EvmParachain } from "@galacticcouncil/xcm-core"
import { isAnyEvmChain } from "./helpers"

const nativeEvmChain = chainsMap.get("hydradx") as EvmParachain

export const NATIVE_EVM_ASSET_SYMBOL = nativeEvmChain.client.chainCurrency
export const NATIVE_EVM_ASSET_DECIMALS = nativeEvmChain.client.chainDecimals
export const NATIVE_EVM_ASSET_ID = import.meta.env
  .VITE_EVM_NATIVE_ASSET_ID as string

export const DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"
export const CALL_PERMIT_ADDRESS = "0x000000000000000000000000000000000000080a"
export const CALL_PERMIT_ABI = `[{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"uint64","name":"gaslimit","type":"uint64"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"dispatch","outputs":[{"internalType":"bytes","name":"output","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`

export function isEvmAccount(address?: string) {
  if (!address) return false

  try {
    const { prefixBytes } = H160
    const pub = decodeAddress(address, true)
    return Buffer.from(pub.subarray(0, prefixBytes.length)).equals(prefixBytes)
  } catch {
    return false
  }
}

export class H160 {
  static prefixBytes = Buffer.from("ETH\0")
  address: string

  constructor(address: string) {
    this.address = safeConvertAddressH160(address) ?? ""
  }

  toAccount = () => {
    const addressBytes = Buffer.from(this.address.slice(2), "hex")
    return encodeAddress(
      new Uint8Array(
        Buffer.concat([H160.prefixBytes, addressBytes, Buffer.alloc(8)]),
      ),
      HYDRA_ADDRESS_PREFIX,
    )
  }

  static fromAccount = (address: string) => {
    const decodedBytes = decodeAddress(address)
    const addressBytes = decodedBytes.slice(H160.prefixBytes.length, -8)
    return (
      safeConvertAddressH160(Buffer.from(addressBytes).toString("hex")) ?? ""
    )
  }
}

export function getEvmTxLink(txHash: string, key = "hydradx") {
  const chain = chainsMap.get(key)

  if (!chain) return ""

  if (chain.isEvmChain()) {
    return `https://wormholescan.io/#/tx/${txHash}`
  } else {
    return `https://hydradx.subscan.io/tx/${txHash}`
  }
}

export function safeConvertAddressH160(value: string): string | null {
  try {
    return getEvmAddress(value?.toLowerCase())
  } catch {
    return null
  }
}

export function getEvmChainById(chainId: number) {
  const chain = Array.from(chainsMap.values()).find(
    (chain) => isAnyEvmChain(chain) && chain.client.chainId === chainId,
  ) as EvmParachain

  if (chain) {
    return chain
  }
}

export { getEvmAddress, isEvmAddress }
