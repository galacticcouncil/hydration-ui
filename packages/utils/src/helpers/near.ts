import { bytesToHex } from "@noble/hashes/utils"
import { AccountId } from "polkadot-api"

import { NearAddr } from "./address"

export const safeConvertNearAddressToSS58 = (
  accountId: string,
  ss58prefix = 0,
) => {
  try {
    return NearAddr.isImplicit(accountId)
      ? AccountId(ss58prefix).dec(`0x${accountId}`)
      : ""
  } catch {
    return ""
  }
}

export const safeConvertSS58ToNearAddress = (ss58Addr: string) => {
  try {
    return bytesToHex(AccountId().enc(ss58Addr))
  } catch {
    return ""
  }
}
