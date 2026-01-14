import { decodeAddress, encodeAddress } from "@polkadot/util-crypto"

export const safeConvertSuiAddressToSS58 = (address: string, prefix = 0) => {
  try {
    return encodeAddress(address, prefix)
  } catch {
    return ""
  }
}
export function safeConvertSS58ToSuiAddress(ss58Addr: string) {
  try {
    const decodedBytes = decodeAddress(ss58Addr)
    return "0x" + Buffer.from(decodedBytes).toString("hex")
  } catch {
    return ""
  }
}
