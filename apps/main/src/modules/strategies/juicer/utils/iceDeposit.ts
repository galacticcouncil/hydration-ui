import { encodeAbiParameters, type Hex } from "viem"

/**
 * An ICE deposit lands over several blocks: the intent is submitted (its input
 * reserved), a solver fills it (the collateral lands in the wallet and the
 * forward is queued), then the lazy executor pushes the collateral through the
 * adapter into the vault.
 */
export type IceDepositStage =
  | "submitting"
  | "submitted"
  | "filled"
  | "deposited"
  | "forwardFailed"
  | "expired"

const PROGRESS: Partial<Record<IceDepositStage, number>> = {
  submitting: 0.1,
  submitted: 1 / 3,
  filled: 2 / 3,
  deposited: 1,
}

/** how far the deposit is, 0..1; null once it failed or expired */
export const readIceDepositProgress = (stage: IceDepositStage) =>
  PROGRESS[stage] ?? null

/** `data` handed to the adapter's `execute`: abi.encode(vault, minShares) */
export const encodeForwardData = (vault: Hex, minShares = 0n) =>
  encodeAbiParameters(
    [{ type: "address" }, { type: "uint256" }],
    [vault, minShares],
  )

/** the least collateral the intent accepts: the sell quote less the slippage */
export const readIceMinAmountOut = (quotedOut: bigint, slippagePct: number) =>
  (quotedOut * BigInt(Math.round((100 - slippagePct) * 100))) / 10_000n

type ChainEvent = { type: string; value: { type: string; value?: unknown } }

export type IceDepositUpdate =
  | {
      stage: "filled"
      /** the id the fill carries: differs from ours after a fork */
      intentId: bigint
      amountIn: bigint
      amountOut: bigint
      forwardId?: bigint
    }
  | { stage: "deposited" }
  | { stage: "forwardFailed"; reason: string }
  | { stage: "expired" }

/**
 * What a block's events say about one ICE deposit, in order. The forward is
 * matched by its queue id, learned from `LazyExecutor.Queued { src: ICE(intentId) }`.
 *
 * The intent id comes from the block the intent landed in. A best block can be
 * retracted and the same transaction land again under another id, so with
 * `match`, a fill queued for this owner for exactly this amount is taken as
 * this deposit's.
 * ponytail: two same-amount deposits by one owner filling in one block can swap ids; harmless, both deposit
 */
export const readIceDepositUpdates = (
  events: readonly ChainEvent[],
  {
    intentId: knownId,
    forwardId,
    match,
  }: {
    intentId: bigint
    forwardId?: bigint
    match?: { isOwner: (who: string) => boolean; amountIn: bigint }
  },
): IceDepositUpdate[] => {
  const payload = (e: ChainEvent) =>
    (e.value.value ?? {}) as Record<string, unknown>
  const srcOf = (e: ChainEvent) =>
    (payload(e).src as { value?: unknown } | undefined)?.value
  const queuedFor = (id: unknown) =>
    events.find(
      (e) =>
        e.type === "LazyExecutor" &&
        e.value.type === "Queued" &&
        srcOf(e) === id,
    )
  const reincluded = match
    ? events.find((e) => {
        if (e.type !== "Intent" || e.value.type !== "IntentResolved")
          return false
        const v = payload(e)
        const q = queuedFor(v.id)
        return (
          v.amount_in === match.amountIn &&
          !!q &&
          match.isOwner(payload(q).who as string)
        )
      })
    : undefined
  const intentId =
    events.some((e) => payload(e).id === knownId || srcOf(e) === knownId) ||
    !reincluded
      ? knownId
      : (payload(reincluded).id as bigint)
  const queued = queuedFor(intentId)
  const queuedId = queued ? (payload(queued).id as bigint) : forwardId

  return events.flatMap((e): IceDepositUpdate[] => {
    const v = payload(e)
    if (e.type === "Intent" && v.id === intentId) {
      if (e.value.type === "IntentResolved")
        return [
          {
            stage: "filled",
            intentId,
            amountIn: v.amount_in as bigint,
            amountOut: v.amount_out as bigint,
            forwardId: queuedId,
          },
        ]
      if (e.value.type === "FailedToQueueCallback")
        return [{ stage: "forwardFailed", reason: "FailedToQueueCallback" }]
      if (e.value.type === "IntentExpired") return [{ stage: "expired" }]
    }
    if (
      e.type === "LazyExecutor" &&
      e.value.type === "Executed" &&
      queuedId !== undefined &&
      v.id === queuedId
    ) {
      const result = v.result as { success?: boolean }
      return [
        result.success
          ? { stage: "deposited" }
          : { stage: "forwardFailed", reason: "ForwardReverted" },
      ]
    }
    return []
  })
}
