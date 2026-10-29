import { HOLLAR_ASSET_ID } from "@galacticcouncil/utils"

import { DepositStatus, exampleDeposits } from "@/modules/ramp/deposit.mock"

import type {
  BankDepositHistory,
  BankDepositHistoryEntry,
} from "./bankDeposits"

const statusMap: Record<DepositStatus, BankDepositHistoryEntry["status"]> = {
  "Received by Bridge": "processing",
  "Sent to Base": "processing",
  Arrived: "processing",
  "Waiting for deposit limit": "attention",
  Depositing: "processing",
  "Queued on Hydration": "processing",
  Credited: "completed",
  Returned: "failed",
}

// The modal and portfolio intentionally share fixtures until a provider is wired.
// These are incoming fiat amounts, never inferred HOLLAR settlement amounts.
export const getBankDepositPreviewHistory = (): BankDepositHistory => ({
  source: "preview",
  deposits: exampleDeposits.map((deposit) => ({
    kind: "bank",
    id: deposit.id,
    amount: deposit.amount,
    symbol: deposit.currency,
    currency: deposit.currency,
    rail: deposit.currency === "USD" ? "ACH / wire" : "SEPA",
    status: statusMap[deposit.status],
    providerStatus: deposit.status,
    sentAt: deposit.sentAt,
    destinationAssetId: HOLLAR_ASSET_ID,
    destinationSymbol: "HOLLAR",
  })),
})
