/** Estimated annual return after harvest fees and both HOLLAR debt legs.
 * Execution costs, ramp time and retained yield are not forecast here.
 */
export const computeVaultApr = ({
  maxLtv,
  leverage,
  borrowRate,
  primeSupplyApy,
  protocolFeeBps,
  mainDiscountBps,
}: {
  maxLtv: number | null | undefined
  leverage: number | null | undefined
  borrowRate: number | null | undefined
  primeSupplyApy: number | null | undefined
  protocolFeeBps: number | null | undefined
  mainDiscountBps: number | null | undefined
}): number | null => {
  if (
    maxLtv === null ||
    maxLtv === undefined ||
    leverage === null ||
    leverage === undefined ||
    borrowRate === null ||
    borrowRate === undefined ||
    primeSupplyApy === null ||
    primeSupplyApy === undefined ||
    protocolFeeBps === null ||
    protocolFeeBps === undefined ||
    mainDiscountBps === null ||
    mainDiscountBps === undefined
  )
    return null
  if (
    ![
      maxLtv,
      leverage,
      borrowRate,
      primeSupplyApy,
      protocolFeeBps,
      mainDiscountBps,
    ].every(Number.isFinite) ||
    maxLtv < 0 ||
    maxLtv > 1 ||
    leverage < 1 ||
    borrowRate < 0 ||
    primeSupplyApy <= -100 ||
    protocolFeeBps < 0 ||
    protocolFeeBps > 10_000 ||
    mainDiscountBps < 0 ||
    mainDiscountBps > 10_000
  )
    return null

  const sourceApr = Math.expm1(Math.log1p(primeSupplyApy / 100) / 8760) * 8760
  const loopCarry = leverage * sourceApr - (leverage - 1) * borrowRate
  const fee = (Math.max(loopCarry, 0) * protocolFeeBps) / 10_000
  const mainBorrow = borrowRate * (1 - mainDiscountBps / 10_000)
  const apr = maxLtv * (loopCarry - fee - mainBorrow)
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
