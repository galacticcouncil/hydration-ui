import Big from "big.js"

export type WithdrawalStep = "amount" | "account" | "review" | "tracking"

export type WithdrawalCurrency = "USD" | "EUR"
export type WithdrawalStatus =
  | "pending"
  | "processing"
  | "completed"
  | "returned"
export type WithdrawalAmountError = "required" | "invalid" | "tooSmall"
export type BankWithdrawalQuote = {
  amount: string
  fee: string
  rate: string
  received: string
  currency: WithdrawalCurrency
}

// These values describe the interactive preview, not a provider quote.
export const BANK_WITHDRAWAL_PREVIEW_FEE = "0.005"
export const BANK_SIMPLIFIED_PREVIEW_FEE = "0.0005"
const PREVIEW_RATES: Record<WithdrawalCurrency, string> = {
  USD: "1",
  EUR: "0.92",
}

export const getBankWithdrawalQuote = (
  amount: string,
  currency: WithdrawalCurrency,
  feeRate = BANK_WITHDRAWAL_PREVIEW_FEE,
): BankWithdrawalQuote | null => {
  if (!/^(?:\d+\.?\d*|\.\d+)$/.test(amount) || amount.length > 80) return null
  const value = Big(amount)
  if (value.lte(0)) return null
  const fee = value.times(feeRate)
  const rate = PREVIEW_RATES[currency]
  const received = value.minus(fee).times(rate).toFixed(2, Big.roundDown)
  if (Big(received).lte(0)) return null
  return {
    amount: value.toString(),
    fee: fee.toString(),
    rate,
    received,
    currency,
  }
}

export const getBankWithdrawalAmountError = (
  amount: string,
  currency: WithdrawalCurrency,
): WithdrawalAmountError | null => {
  if (!amount) return "required"
  if (
    !/^(?:\d+\.?\d*|\.\d+)$/.test(amount) ||
    amount.length > 80 ||
    Big(amount).lte(0)
  )
    return "invalid"
  return getBankWithdrawalQuote(amount, currency) ? null : "tooSmall"
}

export const getDemoWithdrawalBank = (currency: WithdrawalCurrency) => ({
  currency,
  account: currency === "USD" ? "DEMO-USD-ACCOUNT" : "DEMO-IBAN-NOT-VALID",
  routing: currency === "USD" ? "DEMO-ROUTING" : "DEMO-BIC",
})
