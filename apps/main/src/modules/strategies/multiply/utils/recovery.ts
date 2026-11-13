import Big from "big.js"

export type LooperRecovery =
  /** open with `amount`; `clamped` when the market can't take all that's held */
  | { kind: "open"; amount: string; clamped: boolean }
  /** step 1 delivered, but how much isn't known: only switch to the collateral */
  | { kind: "unknown" }
  | { kind: "tooSmall" }
  | { kind: "noRoom" }

/**
 * What the recovery state can offer for collateral a two-step entry bought
 * but didn't open. Human-unit strings; `held` is "" when the amount is
 * unknown, `maxDeposit` null when uncapped or still loading.
 */
export const getLooperRecovery = ({
  held,
  minAmount,
  maxDeposit,
  decimals,
}: {
  held: string
  minAmount: string
  maxDeposit: number | null
  decimals: number
}): LooperRecovery => {
  if (!held) return { kind: "unknown" }
  if (Big(held).lt(minAmount)) return { kind: "tooSmall" }
  if (maxDeposit === null || Big(held).lte(maxDeposit))
    return { kind: "open", amount: held, clamped: false }

  const room = Big(maxDeposit).round(decimals, Big.roundDown)
  return room.lt(minAmount)
    ? { kind: "noRoom" }
    : { kind: "open", amount: room.toString(), clamped: true }
}
