import { isH160Address, safeConvertH160toSS58 } from "@galacticcouncil/utils"

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
