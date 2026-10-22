import type { Address } from "viem"

import { projectAccount } from "@/core/assess/project-account"
import { findByAsset, isAsset } from "@/core/assets"
import { Decimal, toBaseUnits, truncate } from "@/core/big"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive/account"
import { summarizeAccount } from "@/core/derive/account"
import type { Finding, MarketWalletBalances } from "@/types"

export type AssessRepayRequest = SummarizeAccountRequest & {
  /** What the user holds, bounding the max when `spendable` is absent. */
  walletBalances?: MarketWalletBalances
  /** The reserve's underlying asset. */
  asset: Address
  /** Human units; empty or unparsable reads as zero. */
  amount: string
  /**
   * Human units the app will let the user spend — the wallet balance less
   * anything it holds back. Replaces the wallet balance when present.
   */
  spendable?: string
}

export type RepayAssessment = {
  /** Human units, truncated to the asset's decimals. Independent of `amount`. */
  max: string
  /**
   * Whether the wallet covers the whole debt, so repaying the max may send the
   * pool's "all of it" sentinel rather than an amount interest would outgrow.
   */
  maxClearsPosition: boolean
  /** The account after repaying `amount`. */
  projection: AccountSummary
  findings: Finding[]
}

/**
 * What repaying `amount` of `asset` from the wallet would do. Blockers mirror
 * `ValidationLogic.validateRepay` (ADR-0011). Repaying only lowers debt, so no
 * health factor finding is ever raised.
 */
export function assessRepay({
  walletBalances,
  asset,
  amount,
  spendable,
  ...request
}: AssessRepayRequest): RepayAssessment {
  const reserve = findByAsset(request.reserves.reserves, asset)
  const summary = findByAsset(request.summaries, asset)
  const current = summarizeAccount(request)

  const debt = Decimal(
    current.positions.find((position) =>
      isAsset(position.underlyingAsset, asset),
    )?.variableBorrows ?? "0",
  )
  const source = Decimal(
    (spendable ??
      walletBalances?.balances.find((balance) =>
        isAsset(balance.underlyingAsset, asset),
      )?.amount) ||
      "0",
  )
  const amountRaw = toBaseUnits(amount, reserve.decimals)

  const blockers: Finding[] = []
  if (!summary.isActive) {
    blockers.push({ kind: "blocker", code: "reserveInactive", params: {} })
  }
  if (summary.isPaused) {
    blockers.push({ kind: "blocker", code: "reservePaused", params: {} })
  }
  if (debt.eq(0)) {
    blockers.push({ kind: "blocker", code: "noDebt", params: {} })
  }

  const blocked = blockers.length > 0
  const maxClearsPosition = !blocked && source.gte(debt)
  const max = blocked
    ? "0"
    : truncate(source.lt(debt) ? source : debt, reserve.decimals)

  const projection =
    amountRaw === 0n
      ? current
      : projectAccount({
          ...request,
          change: { kind: "repay", asset, amountRaw },
        })

  return {
    max,
    maxClearsPosition,
    projection,
    findings: [
      ...blockers,
      ...(!blocked && !maxClearsPosition
        ? [
            {
              kind: "notice",
              tone: "warning",
              code: "repayLeavesDebt",
              params: {},
            } as const,
          ]
        : []),
    ],
  }
}
