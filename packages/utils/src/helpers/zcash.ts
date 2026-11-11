import { sha256 } from "@noble/hashes/sha2"
import { hexToBytes } from "@noble/hashes/utils"
import { createBase58check } from "@scure/base"
import { AccountId } from "polkadot-api"

import { ZecAddr } from "./address"
import { strip0x } from "./evm"

const ZEC_PAYLOAD_BYTES = 22
const zecBase58check = createBase58check(sha256)

export const safeConvertZecAddressToSS58 = (
  address: string,
  ss58prefix = 0,
) => {
  try {
    const payload = hexToBytes(strip0x(ZecAddr.getPayload(address)))
    const bytes = new Uint8Array(32)
    bytes.set(payload)
    return AccountId(ss58prefix).dec(bytes)
  } catch {
    return ""
  }
}

export const safeConvertSS58ToZecAddress = (ss58Addr: string) => {
  try {
    const bytes = AccountId().enc(ss58Addr)
    if (bytes.subarray(ZEC_PAYLOAD_BYTES).some((b) => b !== 0)) return ""
    const address = zecBase58check.encode(bytes.subarray(0, ZEC_PAYLOAD_BYTES))
    return ZecAddr.isValid(address) ? address : ""
  } catch {
    return ""
  }
}
