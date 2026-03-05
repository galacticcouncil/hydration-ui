export function getMaxLeverage(ltv: number, factor: number = 1): number {
  const theoretical = 1 / (1 - ltv)
  const reduced = theoretical * factor
  return Math.floor(reduced * 10) / 10
}
