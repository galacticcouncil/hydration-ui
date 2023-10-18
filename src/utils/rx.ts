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
