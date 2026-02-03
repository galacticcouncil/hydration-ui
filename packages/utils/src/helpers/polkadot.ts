import { h160 } from "@galacticcouncil/common"
import { toHex } from "@polkadot-api/utils"
import { AccountId, Binary } from "polkadot-api"

const { H160, isEvmAddress } = h160

export const isBinary = (value: unknown): value is Binary =>
  value instanceof Binary

export const safeConvertAddressSS58 = (address: string, ss58prefix = 0) => {
  try {
    return AccountId(ss58prefix).dec(address)
  } catch {
    return ""
  }
}

export const isSS58Address = (address?: string): address is string =>
  !!address && !!safeConvertAddressSS58(address)

export const safeConvertSS58toPublicKey = (address: string) => {
  try {
    return toHex(AccountId().enc(address))
  } catch {
    return ""
  }
}

export const normalizeSS58Address = (address: string) => {
  return isEvmAddress(address)
    ? safeConvertAddressSS58(H160.toAccount(address))
    : safeConvertAddressSS58(address)
}
