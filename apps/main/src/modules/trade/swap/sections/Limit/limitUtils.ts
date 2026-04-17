import Big from "big.js"

/**
 * Format a calculated Big value using the same significant-digit logic
 * as the rest of the app (mirrors getMaxSignificantDigits from @galacticcouncil/utils).
 *
 * ≤ 1        → 4 significant digits   (0.001834)
 * 1–999      → 4 + intLen             (543.5440)
 * 1000–99999 → 2 + intLen             (2855.00)
 * > 99999    → 0 + intLen             (100000)
 */
export const formatCalcValue = (value: Big): string => {
  if (value.eq(0)) return "0"
  const abs = value.abs()
  if (abs.lte(1)) return value.toPrecision(4)

  const intLen = Math.ceil(Math.log10(abs.toNumber() + 1))
  const sigDigits = Math.min(
    21,
    (abs.gt(99999.9999) ? 0 : abs.gt(999.9999) ? 2 : 4) + intLen,
  )

  return value.toPrecision(sigDigits)
}
