import Big from "big.js"

import { DepositCurrency } from "./deposit.mock"

export const getBankDepositAmountError = (
  amount: string,
  currency: DepositCurrency,
): "required" | "invalid" | "minimum" | null => {
  if (!amount) return "required"
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(amount) || amount.length > 80)
    return "invalid"
  const value = Big(amount)
  if (value.lte(0)) return "invalid"
  return currency === "USD" && value.lt(1) ? "minimum" : null
}
