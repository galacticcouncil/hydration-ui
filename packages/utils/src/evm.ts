import { u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { Buffer } from "buffer"
import { Address, checksumAddress, isAddress } from "viem"

const H160_PREFIX_BYTES = Buffer.from("ETH\0")
const ASSET_BASE_ADDRESS = "0000000000000000000000000000000100000000"

export const numToBuffer = (num: number): Buffer => {
  const arr = new Uint8Array(4)
  for (let i = 0; i < 4; i++) arr.set([num / 0x100 ** i], 3 - i)
  return Buffer.from(arr)
}

export const isH160Address = (address?: string): address is string =>
  !!address && isAddress(address)

export function isEvmParachainAccount(address?: string) {
  if (!address) return false

  try {
    const pub = decodeAddress(address, true)
    return Buffer.from(pub.subarray(0, H160_PREFIX_BYTES.length)).equals(
      H160_PREFIX_BYTES,
    )
  } catch {
    return false
  }
}

export const safeConvertAddressH160 = (value: Address | string): string => {
  try {
    const address = value.startsWith("0x") ? value : `0x${value}`
    return checksumAddress(address as Address)
  } catch {
    return ""
  }
}

export const safeConvertH160toSS58 = (address: string) => {
  if (!isH160Address(address)) return ""
  try {
    const addressBytes = Buffer.from(address.slice(2), "hex")
    return encodeAddress(
      new Uint8Array(
        Buffer.concat([H160_PREFIX_BYTES, addressBytes, Buffer.alloc(8)]),
      ),
      63,
    )
  } catch {
    return ""
  }
}

export const safeConvertSS58toH160 = (address: string) => {
  try {
    if (isEvmParachainAccount(address)) {
      const decodedBytes = decodeAddress(address)
      const addressBytes = decodedBytes.slice(H160_PREFIX_BYTES.length, -8)
      return (
        safeConvertAddressH160(Buffer.from(addressBytes).toString("hex")) ?? ""
      )
    } else {
      const decodedBytes = decodeAddress(address)
      const slicedBytes = decodedBytes.slice(0, 20)
      return u8aToHex(slicedBytes)
    }
  } catch {
    return ""
  }
}

export const strip0x = (hex: string): string => {
  return hex.startsWith("0x") ? hex.slice(2) : hex
}

export const getAssetIdFromAddress = (address: string): string => {
  if (!isH160Address(address)) return ""

  try {
    const addressBuffer = Buffer.from(strip0x(address), "hex")
    const assetIdBuffer = addressBuffer.subarray(16)
    return assetIdBuffer.readUIntBE(0, assetIdBuffer.length).toString()
  } catch {
    return ""
  }
}

export const getAddressFromAssetId = (assetId: string): string => {
  try {
    const tokenAddress = Buffer.from(ASSET_BASE_ADDRESS, "hex")
    const assetIdBuffer = numToBuffer(+assetId)
    assetIdBuffer.copy(tokenAddress, 16)

    return "0x" + tokenAddress.toString("hex")
  } catch {
    return ""
  }
}
