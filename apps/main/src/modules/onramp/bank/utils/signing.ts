import {
  EIP1193_USER_REJECTED,
  getEip1193ErrorCode,
} from "@galacticcouncil/web3-connect"

import {
  HbrApiError,
  HbrNetworkError,
  HbrResponseError,
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
  | "unconfirmed"
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
  // No answer (network or timeout): the POST may have been carried out.
  if (error instanceof HbrNetworkError) return "unconfirmed"
  // The server's answer could not be read: the wallet DID sign (doctrine 2).
  if (error instanceof HbrResponseError) return "unknown"
  // The provider's own error object (EthereumSigner.signMessage rethrows it).
  if (getEip1193ErrorCode(error) === EIP1193_USER_REJECTED) return "declined"
  return "walletFailed"
}
