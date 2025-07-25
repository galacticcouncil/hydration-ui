import { encodeAddress, decodeAddress } from "@polkadot/util-crypto"
import { u8aToHex } from "@polkadot/util"
import { Buffer } from "buffer"

import {
  isAddress as isEvmAddress,
  getAddress as getEvmAddress,
} from "@ethersproject/address"
import { chainsMap } from "@galacticcouncil/xcm-cfg"
import { addr, EvmParachain } from "@galacticcouncil/xcm-core"
import { isAnyEvmChain } from "./helpers"
import { createSubscanLink } from "utils/formatting"
import { isMetaMask, isMetaMaskLike } from "utils/metamask"
import { MetaTags } from "state/toasts"

const nativeEvmChain = chainsMap.get("hydration") as EvmParachain

export const NATIVE_EVM_ASSET_SYMBOL = nativeEvmChain.client.chainCurrency
export const NATIVE_EVM_ASSET_DECIMALS = nativeEvmChain.client.chainDecimals
export const NATIVE_EVM_ASSET_ID = import.meta.env
  .VITE_EVM_NATIVE_ASSET_ID as string

export const DISPATCH_ADDRESS = "0x0000000000000000000000000000000000000401"
export const CALL_PERMIT_ADDRESS = "0x000000000000000000000000000000000000080a"
export const CALL_PERMIT_ABI = `[{"inputs":[],"name":"DOMAIN_SEPARATOR","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"address","name":"from","type":"address"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"value","type":"uint256"},{"internalType":"bytes","name":"data","type":"bytes"},{"internalType":"uint64","name":"gaslimit","type":"uint64"},{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"uint8","name":"v","type":"uint8"},{"internalType":"bytes32","name":"r","type":"bytes32"},{"internalType":"bytes32","name":"s","type":"bytes32"}],"name":"dispatch","outputs":[{"internalType":"bytes","name":"output","type":"bytes"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"address","name":"owner","type":"address"}],"name":"nonces","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"}]`
export const GAS_TO_WEIGHT = 25_000

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

export function isEvmWalletExtension(provider: any) {
  return isMetaMask(provider) || isMetaMaskLike(provider)
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
      0,
    )
  }

  static fromAccount = (address: string) => {
    const decodedBytes = decodeAddress(address)
    const addressBytes = decodedBytes.slice(H160.prefixBytes.length, -8)
    return (
      safeConvertAddressH160(Buffer.from(addressBytes).toString("hex")) ?? ""
    )
  }

  static fromSS58 = (address: string) => {
    const decodedBytes = decodeAddress(address)
    const slicedBytes = decodedBytes.slice(0, 20)
    return u8aToHex(slicedBytes)
  }

  static fromAny = (address: string) => {
    if (isEvmAddress(address)) {
      return address
    }

    if (isEvmAccount(address)) {
      return H160.fromAccount(address)
    }

    if (addr.isSs58(address)) {
      return H160.fromSS58(address)
    }

    return ""
  }
}

export function getEvmTxLink(
  txHash: string,
  txData: string | undefined,
  chainKey = "hydration",
  isTestnet = false,
  tags: MetaTags | undefined,
) {
  const chain = chainsMap.get(chainKey)

  if (!chain) return ""

  if (chain.isEvmChain()) {
    const isApproveTx = txData?.startsWith("0x095ea7b3")

    if (tags?.includes("Wormhole") && !isApproveTx) {
      return `https://wormholescan.io/#/tx/${txHash}`
    }

    return `https://etherscan.io/tx/${txHash}`
  }

  if (chain.isEvmParachain()) {
    let explorerUrl = ""
    if (isTestnet && chainKey === "hydration") {
      explorerUrl = "https://explorer.nice.hydration.cloud"
    } else {
      const { blockExplorers } = (chain as EvmParachain)?.client?.chain ?? {}
      explorerUrl = blockExplorers?.default.url ?? ""
    }
    return explorerUrl ? `${explorerUrl}/tx/${txHash}` : ""
  } else {
    return createSubscanLink("extrinsic", txHash, chainKey)
  }
}

export function safeConvertAddressH160(value: string): string | null {
  try {
    return getEvmAddress(value?.toLowerCase())
  } catch {
    return null
  }
}

export function getEvmChainById(chainId: number): EvmParachain | undefined {
  const chain = Array.from(chainsMap.values()).find(
    (chain) => isAnyEvmChain(chain) && chain.client.chainId === chainId,
  ) as EvmParachain

  if (chain) {
    return chain
  }
}

export function strip0x(hex: string): string {
  return hex.startsWith("0x") ? hex.slice(2) : hex
}

export function getAssetIdFromAddress(address: string): string {
  if (!isEvmAddress(address)) return ""

  try {
    const addressBuffer = Buffer.from(strip0x(address), "hex")
    const assetIdBuffer = addressBuffer.subarray(16)
    return assetIdBuffer.readUIntBE(0, assetIdBuffer.length).toString()
  } catch {
    return ""
  }
}

export function getAddressFromAssetId(assetId: string): string {
  try {
    const tokenAddress = Buffer.from(
      "0000000000000000000000000000000100000000",
      "hex",
    )
    const assetIdBuffer = numToBuffer(+assetId)
    assetIdBuffer.copy(tokenAddress, 16)

    return "0x" + tokenAddress.toString("hex")
  } catch {
    return ""
  }
}

function numToBuffer(num: number): Buffer {
  const arr = new Uint8Array(4)
  for (let i = 0; i < 4; i++) arr.set([num / 0x100 ** i], 3 - i)
  return Buffer.from(arr)
}

export { getEvmAddress, isEvmAddress }
