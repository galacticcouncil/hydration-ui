export const pluck = <TArr, TKey extends keyof TArr>(
  key: TKey,
  arr: TArr[],
): TArr[TKey][] => arr.map((item) => item[key])
