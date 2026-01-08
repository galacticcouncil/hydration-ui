import { h160 } from "@galacticcouncil/common"
import { u8aToHex } from "@polkadot/util"
import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"
import { Binary } from "polkadot-api"

const { H160, isEvmAddress } = h160

export const isBinary = (value: unknown): value is Binary =>
  value instanceof Binary

export const safeConvertAddressSS58 = (address: string, ss58prefix = 0) => {
  try {
    return encodeAddress(decodeAddress(address), ss58prefix)
  } catch {
    return ""
  }
}

export const isSS58Address = (address?: string): address is string =>
  !!address && !!safeConvertAddressSS58(address)

export const safeConvertSS58toPublicKey = (address: string) => {
  try {
    return u8aToHex(decodeAddress(address))
  } catch {
    return ""
  }
}

export const normalizeSS58Address = (address: string) => {
  return isEvmAddress(address)
    ? H160.toAccount(address)
    : safeConvertAddressSS58(address)
}
