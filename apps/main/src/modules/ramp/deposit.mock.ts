// Frontend-only fixtures. Never use these values as bank transfer instructions.
export type DepositCurrency = "USD" | "EUR"
export type RailStatus =
  | "available"
  | "in review"
  | "more info needed"
  | "rejected"
  | "not offered in region"
export type DepositStatus =
  | "Received by Bridge"
  | "Sent to Base"
  | "Arrived"
  | "Waiting for deposit limit"
  | "Depositing"
  | "Queued on Hydration"
  | "Credited"
  | "Returned"

export const depositSteps: DepositStatus[] = [
  "Received by Bridge",
  "Sent to Base",
  "Arrived",
  "Depositing",
  "Queued on Hydration",
  "Credited",
]

export const exampleDeposits: {
  id: string
  amount: string
  currency: DepositCurrency
  date: string
  status: DepositStatus
}[] = [
  {
    id: "deposit-001",
    amount: "500.00",
    currency: "USD",
    date: "19 Oct 2026 · 10:42",
    status: "Waiting for deposit limit",
  },
  {
    id: "deposit-002",
    amount: "250.00",
    currency: "EUR",
    date: "18 Oct 2026 · 14:20",
    status: "Credited",
  },
  {
    id: "deposit-003",
    amount: "100.00",
    currency: "USD",
    date: "17 Oct 2026 · 09:15",
    status: "Returned",
  },
]

export const exampleDetails: Record<
  DepositCurrency,
  { label: string; value: string }[]
> = {
  USD: [
    { label: "Bank name", value: "Example Bank · demo only" },
    { label: "Routing number", value: "DEMO-ROUTING" },
    { label: "Account number", value: "DEMO-ACCOUNT-1234" },
    { label: "Beneficiary", value: "Example account holder" },
    { label: "Transfer method", value: "ACH / wire" },
  ],
  EUR: [
    { label: "Bank name", value: "Example Bank Europe · demo only" },
    { label: "IBAN", value: "DEMO-IBAN-DO-NOT-TRANSFER" },
    { label: "BIC", value: "DEMO-BIC" },
    { label: "Beneficiary", value: "Example account holder" },
    { label: "Transfer method", value: "SEPA" },
  ],
}
