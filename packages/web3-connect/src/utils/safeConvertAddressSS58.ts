import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"

export function safeConvertAddressSS58(
  address: string | undefined,
  ss58prefix: number,
) {
  try {
    return encodeAddress(decodeAddress(address), ss58prefix)
  } catch {
    return null
  }
}
