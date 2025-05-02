import Big from "big.js"

export function toBig(value: string | number) {
  if (!value || value === null || value === undefined || isNaN(Number(value))) {
    return null
  }
  return new Big(value)
}
