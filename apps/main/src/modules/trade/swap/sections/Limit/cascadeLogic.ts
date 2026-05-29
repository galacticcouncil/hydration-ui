import Big from "big.js"

import { formatCalcValue } from "@/modules/trade/swap/sections/Limit/limitUtils"

/**
 * Cascade model — "last two wins" (CoW Swap-style).
 *
 * The form has three coupled fields: sell amount, buy amount, limit
 * price. They satisfy `buy = sell × price` at all times. At any moment
 * exactly two of them are "kept" (the user-committed pair) and the
 * third "derives" from those two. When the user types into a field, it
 * becomes the most recently-touched kept field; whatever was previously
 * kept-but-second-most-recent becomes the new derived field.
 *
 * The lock pill (`isLocked`) overrides this rule by forcing `sell` to
 * stay in the kept pair regardless of touch recency — a "preserve sell"
 * escape hatch for users who want to fix the sell amount and let the
 * other two cascade through it.
 */

export type FieldName = "sell" | "buy" | "price"
export type LastTwo = [FieldName, FieldName]
export const ALL_FIELDS: readonly FieldName[] = ["sell", "buy", "price"]

/** The third field — the one that's not in `lastTwo` — is what derives. */
export const getDerived = (lastTwo: LastTwo): FieldName =>
  ALL_FIELDS.find((f) => f !== lastTwo[0] && f !== lastTwo[1]) as FieldName

/**
 * When the user touches `field`, recompute the kept pair.
 *
 *   - Lock ON: sell is forced to stay kept. If user typed sell, it
 *     becomes most-recent and the other kept stays. If user typed
 *     buy/price, it becomes most-recent and sell is the second kept
 *     (so price/buy — whichever wasn't touched — becomes derived).
 *   - Lock OFF: standard "newest typed bumps to most-recent". If the
 *     touched field was already most-recent, no change.
 */
export const updateLastTwoOnTouch = (
  prev: LastTwo,
  touched: FieldName,
  isLocked: boolean,
): LastTwo => {
  if (isLocked) {
    if (touched === "sell") {
      const otherKept = prev.find((f) => f !== "sell")
      return ["sell", (otherKept as FieldName | undefined) ?? "price"]
    }
    return [touched, "sell"]
  }
  if (prev[0] === touched) return prev
  return [touched, prev[0]]
}

/**
 * Toggling lock=ON: force sell into the kept pair without a "user
 * touched sell" semantic. We replace the *second*-most-recent kept
 * field with sell (preserves whatever the user most-recently touched
 * as still-most-recent).
 */
export const lockSellIntoLastTwo = (prev: LastTwo): LastTwo => {
  if (prev.includes("sell")) return prev
  return [prev[0], "sell"]
}

export interface FieldValues {
  readonly sell: string
  readonly buy: string
  readonly price: string
}

/**
 * Compute the value of the derived field from the two kept values.
 * Returns null if the inputs aren't suitable (missing, zero, negative,
 * or non-parseable). Caller should treat null as "leave derived empty".
 */
export const computeDerived = (
  derived: FieldName,
  values: FieldValues,
): string | null => {
  try {
    if (derived === "buy") {
      const s = new Big(values.sell || "0")
      const p = new Big(values.price || "0")
      if (s.lte(0) || p.lte(0)) return null
      return formatCalcValue(s.times(p))
    }
    if (derived === "sell") {
      const b = new Big(values.buy || "0")
      const p = new Big(values.price || "0")
      if (b.lte(0) || p.lte(0)) return null
      return formatCalcValue(b.div(p))
    }
    // derived === "price"
    const s = new Big(values.sell || "0")
    const b = new Big(values.buy || "0")
    if (s.lte(0) || b.lte(0)) return null
    return formatCalcValue(b.div(s))
  } catch {
    return null
  }
}
