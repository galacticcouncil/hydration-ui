// Converts a scientific-notation numeric string ("4.8584e+5", "1.2e-7") to a
// plain decimal string ("485840", "0.00000012"). Returns the input unchanged
// if it isn't in scientific notation or can't be parsed.
const expandScientificNotation = (value: string): string => {
  if (!/e[+-]?\d+/i.test(value)) return value
  const num = Number(value)
  if (!isFinite(num) || isNaN(num)) return value
  // Up to 20 fraction digits covers typical on-chain asset precisions and
  // preserves integer values exactly (toFixed collapses exponent).
  return num
    .toFixed(20)
    .replace(/(\.\d*?)0+$/, "$1") // trim trailing zeros in fractional part
    .replace(/\.$/, "") // drop stray trailing dot
}

export const defaultAssetValueFormatter = (value: string): string => {
  const expanded = expandScientificNotation(value.toString())
  const parts = expanded.split(".")
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, " ")

  return parts.join(".")
}
