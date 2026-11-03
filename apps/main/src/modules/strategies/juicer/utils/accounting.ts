import Big from "big.js"
import { formatUnits } from "viem"

/** Estimated annual return after harvest fees and both HOLLAR debt legs.
 * Execution costs, ramp time and retained yield are not forecast here.
 */
export const computeVaultApr = ({
  targetLtv,
  leverage,
  borrowRate,
  primeSupplyApy,
  protocolFeeBps,
  mainDiscountBps,
  loopDiscountBps,
}: {
  targetLtv: number | null | undefined
  leverage: number | null | undefined
  borrowRate: number | null | undefined
  primeSupplyApy: number | null | undefined
  protocolFeeBps: number | null | undefined
  mainDiscountBps: number | null | undefined
  loopDiscountBps: number | null | undefined
}): number | null => {
  if (
    targetLtv === null ||
    targetLtv === undefined ||
    leverage === null ||
    leverage === undefined ||
    borrowRate === null ||
    borrowRate === undefined ||
    primeSupplyApy === null ||
    primeSupplyApy === undefined ||
    protocolFeeBps === null ||
    protocolFeeBps === undefined ||
    mainDiscountBps === null ||
    mainDiscountBps === undefined ||
    loopDiscountBps === null ||
    loopDiscountBps === undefined
  )
    return null
  if (
    ![
      targetLtv,
      leverage,
      borrowRate,
      primeSupplyApy,
      protocolFeeBps,
      mainDiscountBps,
      loopDiscountBps,
    ].every(Number.isFinite) ||
    targetLtv < 0 ||
    targetLtv > 1 ||
    leverage < 1 ||
    borrowRate < 0 ||
    primeSupplyApy <= -100 ||
    protocolFeeBps < 0 ||
    protocolFeeBps > 10_000 ||
    mainDiscountBps < 0 ||
    mainDiscountBps > 10_000 ||
    loopDiscountBps < 0 ||
    loopDiscountBps > 10_000
  )
    return null

  const sourceApr = Math.expm1(Math.log1p(primeSupplyApy / 100) / 8760) * 8760
  const loopBorrow = borrowRate * (1 - loopDiscountBps / 10_000)
  const loopCarry = leverage * sourceApr - (leverage - 1) * loopBorrow
  const fee = (Math.max(loopCarry, 0) * protocolFeeBps) / 10_000
  const mainBorrow = borrowRate * (1 - mainDiscountBps / 10_000)
  const apr = targetLtv * (loopCarry - fee - mainBorrow)
  return apr * 100
}

/** Exact completion is independent of a rounded display percentage. */
export const withdrawalComplete = (
  started: boolean,
  repaid: bigint,
  debtShare: bigint,
) => started && repaid >= debtShare

export type WithdrawalState =
  | "cooldown"
  | "pending"
  | "partial"
  | "settled"
  | "claimed"

export const withdrawalState = ({
  active,
  started,
  eligibleAt,
  now,
  complete,
  settledAmount,
}: {
  active: boolean
  started: boolean
  eligibleAt: number
  now: number
  complete: boolean
  settledAmount: number
}): WithdrawalState => {
  if (!active) return "claimed"
  if (!started) return now < eligibleAt ? "cooldown" : "pending"
  if (complete) return "settled"
  return settledAmount > 0 ? "partial" : "pending"
}

/**
 * Price of one vault share. Shares rebase with funded earnings, so the rate
 * stays near 1; unharvested yield is outside both the balance and the rate.
 */
export const sharePrice = (
  underlyingPrice: string | null,
  exchangeRateWad: bigint,
): string | null =>
  underlyingPrice === null
    ? null
    : Big(underlyingPrice).times(formatUnits(exchangeRateWad, 18)).toString()
