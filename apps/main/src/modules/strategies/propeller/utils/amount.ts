import { parseUnits } from "viem"

/** Reject extra precision instead of silently rounding a financial instruction. */
export const parseExactAmount = (value: string, decimals: number) => {
  if (
    !/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(value) ||
    (value.split(".")[1]?.length ?? 0) > decimals
  )
    throw new Error("Enter an amount within the token's decimal precision")
  const amount = parseUnits(value, decimals)
  if (amount <= 0n) throw new Error("Enter a positive amount")
  return amount
}

export const isExactAmount = (value: string, decimals: number) => {
  try {
    parseExactAmount(value, decimals)
    return true
  } catch {
    return false
  }
}
