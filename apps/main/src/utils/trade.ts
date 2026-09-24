export const isHydrationAssetId = (id: string): boolean => {
  if (!/^\d+$/.test(id)) return false

  const value = Number(id)
  return Number.isSafeInteger(value)
}

export const getTradeFeeIntervals = (
  min: number,
  max: number,
  num = 3,
): ReadonlyArray<number> => {
  const { log2 } = Math

  return Array.from(
    { length: num + 1 },
    (_, index) => 2 ** (log2(min) + (index / num) * (log2(max) - log2(min))),
  )
}
