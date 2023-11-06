export const pluck = <TArr, TKey extends keyof TArr>(
  key: TKey,
  arr: TArr[],
): TArr[TKey][] => arr.map((item) => item[key])

export const omit = <T, K extends keyof T>(keys: K[], obj: T): Omit<T, K> => {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

export const groupBy = <T>(
  array: T[],
  groupByFn: (item: T) => string,
): Record<string, T[]> => {
  return array.reduce(
    (result, item) => {
      const key = groupByFn(item)
      if (!result[key]) {
        result[key] = []
      }
      result[key].push(item)
      return result
    },
    {} as Record<string, T[]>,
  )
}
