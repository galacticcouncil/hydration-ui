import {
  TransactionError,
  TTxErrorData,
} from "sections/transaction/ReviewTransaction.utils"

type MetaMaskErrorObject = { data: { code: number; message: string } }

function isMetaMaskErrorObject(error: unknown): error is MetaMaskErrorObject {
  const data = (error as any)?.data
  return typeof data?.code === "number" && typeof data?.message === "string"
}

export function parseErrorMessage(error: unknown) {
  try {
    switch (true) {
      case isMetaMaskErrorObject(error):
        return error.data.message
      case typeof error === "object":
        return JSON.stringify(error)
      case error instanceof TransactionError:
      case error instanceof Error:
        return error.message
      default:
        return `${error}`
    }
  } catch {
    return ""
  }
}

export function getErrorTemplate(data: TTxErrorData = {}) {
  return Object.entries(data)
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n")
}
