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
