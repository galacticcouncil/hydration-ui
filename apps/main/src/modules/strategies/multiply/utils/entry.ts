import { getIntentFloors } from "@/modules/strategies/multiply/utils/projection"

/** `Router.Executed` payload: the `.payload` of what `papi.event.Router.Executed.filter` returns. */
export type RouterExecutedEvent = {
  asset_in: number
  asset_out: number
  amount_out: bigint
}

/** `Stableswap.LiquidityAdded` payload; a pool's id is its share token's id. */
export type LiquidityAddedEvent = {
  pool_id: number
  who: string
  shares: bigint
}

/** Collateral balance at the step-1 block and at the block before it. */
export type BalanceSnapshot = { before: bigint; after: bigint }

export type LooperEntryInput = {
  account: string
  payAssetId: string
  collateralAssetId: string
  step1:
    | {
        variant: "sell"
        events: { routerExecuted: RouterExecutedEvent[] }
        balances?: BalanceSnapshot
      }
    | {
        variant: "proportional"
        events: { liquidityAdded: LiquidityAddedEvent[] }
        balances?: BalanceSnapshot
      }
  minAmount: bigint
  maxDeposit: bigint | null
  feeBudget: bigint
  floors: Omit<Parameters<typeof getIntentFloors>[0], "amount">
}

const getReceivedFromEvents = ({
  account,
  payAssetId,
  collateralAssetId,
  step1,
}: LooperEntryInput) => {
  if (step1.variant === "proportional") {
    return (
      step1.events.liquidityAdded.find(
        (e) => e.who === account && e.pool_id === Number(collateralAssetId),
      )?.shares ?? 0n
    )
  }
  return (
    step1.events.routerExecuted.find(
      (e) =>
        e.asset_in === Number(payAssetId) &&
        e.asset_out === Number(collateralAssetId),
    )?.amount_out ?? 0n
  )
}

// Never the quote or a balance total: only what step 1 delivered. Events
// first; the balance diff covers results without events (EVM, WETH fee).
const getReceived = (input: LooperEntryInput) => {
  const fromEvents = getReceivedFromEvents(input)
  const { balances } = input.step1
  if (fromEvents > 0n || !balances) return fromEvents
  const diff = balances.after - balances.before
  return diff > 0n ? diff : 0n
}

export type LooperEntryError =
  | "nothingReceived"
  | "belowMinimum"
  | "aboveMarketRoom"

export type LooperEntry =
  | {
      ok: true
      received: bigint
      open: {
        amount: bigint
        minIntentDebt: bigint
        minIntentAToken: bigint
        feeBudget: bigint
      }
    }
  | { ok: false; error: LooperEntryError; received: bigint }

/**
 * Step 2 of a two-step Looper entry: the collateral step 1 delivered, and the
 * `factory.open` arguments for exactly that amount.
 */
export const getLooperEntry = (input: LooperEntryInput): LooperEntry => {
  const { feeBudget, floors, minAmount, maxDeposit } = input
  const received = getReceived(input)

  const error: LooperEntryError | null =
    received === 0n
      ? "nothingReceived"
      : received < minAmount
        ? "belowMinimum"
        : maxDeposit !== null && received > maxDeposit
          ? "aboveMarketRoom"
          : null
  if (error) return { ok: false, error, received }

  return {
    ok: true as const,
    received,
    open: {
      amount: received,
      ...getIntentFloors({ amount: received, ...floors }),
      feeBudget,
    },
  }
}
