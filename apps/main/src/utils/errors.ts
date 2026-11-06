import { isH160Address, safeConvertH160toSS58 } from "@galacticcouncil/utils"

import { useProviderRpcUrlStore } from "@/states/provider"

const hasStringMessage = (value: unknown): value is { message: string } =>
  typeof value === "object" &&
  value !== null &&
  "message" in value &&
  typeof value.message === "string" &&
  value.message.length > 0

/** Prefer API response body.message (e.g. 1Click ApiError) over generic status text. */
export const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") {
    return error
  }

  if (error && typeof error === "object") {
    const bodyMessage =
      "body" in error && hasStringMessage(error.body)
        ? error.body.message
        : null

    if (bodyMessage) {
      return bodyMessage
    }

    if (hasStringMessage(error)) {
      return error.message
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return String(error)
}

// polkadot-js and Talisman reject with "Cancelled", SubWallet and WalletConnect
// with "Rejected by user", EVM wallets with code 4001 / "User rejected the request."
const WALLET_REJECTION =
  /^(cancell?ed|rejected)\.?$|user (rejected|denied|cancell?ed)|rejected by (the )?user|request rejected/i

/** The user declined to sign in their wallet: nothing was sent. */
export const isWalletRejection = (error: unknown): boolean => {
  if (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === 4001
  )
    return true
  if (error === null || error === undefined) return false
  // a submit error arrives as "<name>.<message>", e.g. "Error.Cancelled"
  const message = getErrorMessage(error)
    .trim()
    .replace(/^\w*Error\./, "")
  return WALLET_REJECTION.test(message)
}

/**
 * The pool refused the transaction because its nonce was already used: another
 * transaction from the account (another tab, another device) went first.
 * Nothing was sent; signing again takes the next nonce.
 */
export const isNonceClash = (error: unknown): boolean => {
  if (error === null || error === undefined) return false
  return /^(\w*Error\.)?Invalid\.Stale$/.test(getErrorMessage(error).trim())
}

type ErrorContext = {
  message: string
  address: string
  wallet: string
  specVersion: string
  blockNumber: string
  path: string
  feePaymentAsset: string
  transaction?: string
}

export function stringifyErrorContext(data: ErrorContext) {
  const { connectedRpcUrl, autoMode } = useProviderRpcUrlStore.getState()

  return Object.entries({
    ...data,
    rpc: connectedRpcUrl,
    autoMode: autoMode ? "enabled" : "disabled",
  })
    .map(([key, value]) => {
      if (key === "address" && isH160Address(value))
        return `${key}: ${value} (${safeConvertH160toSS58(value)})`

      return `${key}: ${value}`
    })
    .join("\n")
}
