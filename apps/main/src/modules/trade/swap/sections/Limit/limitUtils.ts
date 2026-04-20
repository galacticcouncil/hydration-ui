import Big from "big.js"

/**
 * Strip trailing zeros after the decimal point (and the decimal point
 * itself if the fractional part is empty). "80000.00" → "80000",
 * "0.00001250" → "0.0000125", "81237.40" → "81237.4".
 */
const stripTrailingZeros = (s: string): string => {
  if (!s.includes(".") || s.includes("e") || s.includes("E")) return s
  return s.replace(/\.?0+$/, "")
}

/**
 * Format a calculated Big value using the same significant-digit logic
 * as the rest of the app (mirrors getMaxSignificantDigits from @galacticcouncil/utils).
 *
 * ≤ 1        → 4 significant digits   (0.001834)
 * 1–999      → 4 + intLen             (543.544)
 * 1000–99999 → 2 + intLen             (2855)
 * > 99999    → 0 + intLen             (100000)
 *
 * Trailing zeros are stripped so user input like "80000" doesn't
 * round-trip back as "80000.00".
 */
export const formatCalcValue = (value: Big): string => {
  if (value.eq(0)) return "0"
  const abs = value.abs()
  if (abs.lte(1)) return stripTrailingZeros(value.toPrecision(4))

  const intLen = Math.ceil(Math.log10(abs.toNumber() + 1))
  const sigDigits = Math.min(
    21,
    (abs.gt(99999.9999) ? 0 : abs.gt(999.9999) ? 2 : 4) + intLen,
  )

  return stripTrailingZeros(value.toPrecision(sigDigits))
}
