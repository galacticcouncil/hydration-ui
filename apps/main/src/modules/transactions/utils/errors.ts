import { isEvmAccount } from "@galacticcouncil/sdk"
import { safeConvertSS58toH160 } from "@galacticcouncil/utils"

type TxErrorContext = {
  message: string
  address: string
  wallet: string
  specVersion: string
  blockNumber: string
  path: string
  feePaymentAsset: string
  transaction?: string
}

export function stringifyTxErrorContext(data: TxErrorContext) {
  return Object.entries(data)
    .map(([key, value]) => {
      if (key === "address" && isEvmAccount(value))
        return `${key}: ${safeConvertSS58toH160(value)} (${value})`

      return `${key}: ${value}`
    })
    .join("\n")
}
