import { isH160Address, safeConvertH160toSS58 } from "@galacticcouncil/utils"

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
  return Object.entries(data)
    .map(([key, value]) => {
      if (key === "address" && isH160Address(value))
        return `${key}: ${value} (${safeConvertH160toSS58(value)})`

      return `${key}: ${value}`
    })
    .join("\n")
}
