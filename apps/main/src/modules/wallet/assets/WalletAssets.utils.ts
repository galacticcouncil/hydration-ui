import Big from "big.js"

export const hasVisibleDisplayValue = (value?: string) => {
  if (!value) return false

  try {
    return Big(value).gt(0)
  } catch {
    return false
  }
}
