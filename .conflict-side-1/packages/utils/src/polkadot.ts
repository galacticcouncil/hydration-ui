import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"

export const safeConvertAddressSS58 = (address: string, ss58prefix = 0) => {
  try {
    return encodeAddress(decodeAddress(address), ss58prefix)
  } catch {
    return ""
  }
}

export const isSS58Address = (address?: string): address is string =>
  !!address && !!safeConvertAddressSS58(address)
