import Big from "big.js"
import { daysInYear, millisecondsInDay } from "date-fns/constants"

import { STABLE_BONDS } from "@/modules/strategies/stable-bonds/config/bonds"

export const getBondApr = (
  bondId: string,
  timeLeftMs: number,
): number | null => {
  const config = STABLE_BONDS[bondId]
  if (!config) return null
  const { fixedYield } = config
  const daysLeft =
    timeLeftMs > 0 ? Math.ceil(timeLeftMs / millisecondsInDay) : 0
  return daysLeft > 0 ? (fixedYield / daysLeft) * daysInYear : null
}

export const getDefaultBondApr = (bondId: string): number | null => {
  const config = STABLE_BONDS[bondId]
  if (!config) return null
  return getBondApr(bondId, config.termDays * millisecondsInDay)
}

/**
 * Bonds redeem 1:1 into their underlying at maturity, so rolling over trades
 * 1 HOLLAR at the old maturity for `rate` HOLLAR at the new one. The gain is
 * therefore earned over the window between the two maturities — or, once the
 * old bond has matured and is redeemable today, between now and the new one.
 */
export const getRolloverApr = (
  rate: Big,
  oldMaturity: number,
  newMaturity: number,
  now: number,
): number | null => {
  const days = Math.ceil(
    (newMaturity - Math.max(now, oldMaturity)) / millisecondsInDay,
  )

  if (days <= 0) return null

  return rate.minus(1).times(100).div(days).times(daysInYear).toNumber()
}
