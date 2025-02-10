import { u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { Buffer } from "buffer"
import { Address, checksumAddress, isAddress } from "viem"

export const isEvmAddress = isAddress

export const safeConvertAddressH160 = (
  value: Address | string,
): string | null => {
  try {
    return checksumAddress(value as Address)
  } catch {
    return null
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
}
