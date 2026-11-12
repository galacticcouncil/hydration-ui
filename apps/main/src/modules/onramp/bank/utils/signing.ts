import {
  EIP1193_USER_REJECTED,
  getEip1193ErrorCode,
} from "@galacticcouncil/web3-connect"

import {
  HbrApiError,
  HbrNetworkError,
} from "@/modules/onramp/bank/utils/hbrErrors"
import {
  BankErrorKind,
  classifyBankError,
} from "@/modules/onramp/bank/utils/onboarding"

/**
 * How a failed sign-in or wallet link is shown. Both only sign a message
 * (no funds move), so each may be started again with a fresh challenge.
 */
export type SignErrorKind =
  | "declined"
  | "walletFailed"
  | "refused"
  | "bindTaken"
  | BankErrorKind

export const classifySignError = (error: unknown): SignErrorKind => {
  if (error instanceof HbrApiError) {
    // POST /v1/auth/session: every verification refusal is a 401.
    if (error.status === 401 && error.code === "unauthorized") return "refused"
    if (error.status === 422 && error.code === "bind_refused") return "refused"
    if (error.status === 409 && error.code === "bind_refused")
      return "bindTaken"
    return classifyBankError(error)
  }
  if (error instanceof HbrNetworkError) return "unavailable"
  // The provider's own error object (EthereumSigner.signMessage rethrows it).
  if (getEip1193ErrorCode(error) === EIP1193_USER_REJECTED) return "declined"
  return "walletFailed"
}
