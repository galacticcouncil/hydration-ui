import type { Address } from "viem"

import { Decimal, toBaseUnits, truncate } from "@/core/big"
import type {
  AccountSummary,
  SummarizeAccountRequest,
} from "@/core/derive-account"
import { summarizeAccount } from "@/core/derive-account"
import { healthFactorFindings, supplyCapFindings } from "@/core/finding-rules"
import { projectAccount } from "@/core/project-account"
import type {
  Finding,
  IsolationJoin,
  MarketWalletBalances,
  Reserve,
  ReserveSummary,
} from "@/types"

export type AssessSupplyRequest = SummarizeAccountRequest & {
  /** What the user holds, bounding the max when `spendable` is absent. */
  walletBalances?: MarketWalletBalances
  /** The reserve's underlying asset. */
  asset: Address
  /** Human units; empty or unparsable reads as zero. */
  amount: string
  /** Who is credited with the supply, when it is not the positions' user. */
  onBehalfOf?: Address
  /**
   * Human units the app will let the user spend — the wallet balance less
   * whatever it reserves (fees, existential deposit). Overrides the wallet
   * balance when present.
   */
  spendable?: string
}

export type SupplyAssessment = {
  /** Human units, truncated to the asset's decimals. Independent of `amount`. */
  max: string
  /** The account after supplying `amount`. */
  projection: AccountSummary
  /** Present when the supply must first turn the other collateral off. */
  isolationJoin?: IsolationJoin
  findings: Finding[]
}

/**
 * What supplying `amount` of `asset` would do. Blockers mirror
 * `ValidationLogic.validateSupply` (ADR-0011); isolation-mode handling mirrors
 * `validateUseAsCollateral`, which the pool runs on a first supply.
 */
export function assessSupply({
  walletBalances,
  asset,
  amount,
  onBehalfOf,
  spendable,
  ...request
}: AssessSupplyRequest): SupplyAssessment {
  const reserve = findByAsset(request.reserves.reserves, asset)
  const summary = findByAsset(request.summaries, asset)
  const current = summarizeAccount(request)

  const hasDebt = Decimal(
    current.account.totalBorrowsMarketReferenceCurrency,
  ).gt(0)
  const otherCollateral = current.positions.filter(
    (position) =>
      !isAsset(position.underlyingAsset, asset) &&
      position.usageAsCollateralEnabledOnUser &&
      Decimal(position.underlyingBalance).gt(0),
  )
  const isActiveCollateral = current.positions.some(
    (position) =>
      isAsset(position.underlyingAsset, asset) &&
      position.usageAsCollateralEnabledOnUser,
  )
  const forSelf =
    onBehalfOf === undefined || isAsset(onBehalfOf, request.positions.user)

  const blockers: Finding[] = []
  if (!summary.isActive) {
    blockers.push({ kind: "blocker", code: "reserveInactive", params: {} })
  }
  if (summary.isPaused) {
    blockers.push({ kind: "blocker", code: "reservePaused", params: {} })
  }
  if (summary.isFrozen) {
    blockers.push({ kind: "blocker", code: "reserveFrozen", params: {} })
  }

  const isolationSupplyWithDebt =
    summary.isIsolated && hasDebt && !isActiveCollateral
  if (isolationSupplyWithDebt) {
    blockers.push({
      kind: "blocker",
      code: "isolationSupplyWithDebt",
      params: {},
    })
  }

  const isolationJoin: IsolationJoin | undefined =
    summary.isIsolated &&
    !isActiveCollateral &&
    otherCollateral.length > 0 &&
    !isolationSupplyWithDebt &&
    forSelf
      ? {
          disableCollateral: otherCollateral.map(
            (position) => position.underlyingAsset,
          ),
        }
      : undefined

  const notices: Finding[] = [...supplyCapFindings(summary)]
  if (isolationJoin) {
    notices.push({
      kind: "notice",
      tone: "warning",
      code: "isolationJoinDisablesCollateral",
      params: { symbol: summary.symbol },
    })
  }
  if (
    summary.isIsolated &&
    !isActiveCollateral &&
    otherCollateral.length === 0 &&
    !Decimal(summary.ltv).eq(0) &&
    !isolationSupplyWithDebt &&
    forSelf
  ) {
    notices.push({
      kind: "notice",
      tone: "info",
      code: "enteringIsolationMode",
      params: {},
    })
  }

  const amountRaw = toBaseUnits(amount, reserve.decimals)
  const projection =
    amountRaw === 0n
      ? current
      : projectAccount({
          ...request,
          change: {
            kind: isolationJoin ? "isolationJoin" : "supply",
            asset,
            amountRaw,
          },
        })

  return {
    max: supplyMax({
      summary,
      decimals: reserve.decimals,
      spendable:
        spendable ??
        walletBalances?.balances.find((balance) =>
          isAsset(balance.underlyingAsset, asset),
        )?.amount ??
        "0",
    }),
    projection,
    ...(isolationJoin && { isolationJoin }),
    findings: [
      ...blockers,
      ...healthFactorFindings({
        current: current.account.healthFactor,
        projected: projection.account.healthFactor,
        hasDebt: Decimal(
          projection.account.totalBorrowsMarketReferenceCurrency,
        ).gt(0),
      }),
      ...notices,
    ],
  }
}

/**
 * The most the pool would accept: what the user can spend, bounded by the
 * room left under the supply cap. Nothing when the reserve takes no supply.
 */
function supplyMax({
  summary,
  decimals,
  spendable,
}: {
  summary: ReserveSummary
  decimals: number
  spendable: string
}): string {
  if (!summary.isActive || summary.isPaused || summary.isFrozen) return "0"

  const capRoom = Decimal(summary.supplyCap).minus(summary.totalLiquidity)
  const max =
    Decimal(summary.supplyCap).eq(0) || Decimal(spendable).lt(capRoom)
      ? Decimal(spendable)
      : capRoom

  return truncate(max, decimals)
}

function findByAsset<Entry extends Reserve | ReserveSummary>(
  entries: Entry[],
  asset: Address,
): Entry {
  const entry = entries.find((candidate) =>
    isAsset(candidate.underlyingAsset, asset),
  )
  if (!entry) throw new Error(`No reserve for ${asset} in this market`)

  return entry
}

/** Chain addresses are lowercased at decode; a caller's may be checksummed. */
function isAsset(a: Address, b: Address): boolean {
  return a.toLowerCase() === b.toLowerCase()
}
