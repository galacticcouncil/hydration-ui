export const prop =
  <T extends object, K extends keyof T>(key: K) =>
  (obj: T): T[K] =>
    obj[key]

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

type Pick<T, K extends keyof T> = {
  [P in K]: T[P]
}

export const pick = <T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    result[key] = obj[key]
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

export function uniqBy<T, K>(keyFn: (item: T) => K, list: T[]): T[] {
  const seen = new Set<K>()
  const result: T[] = []

  for (const item of list) {
    const key = keyFn(item)
    if (!seen.has(key)) {
      seen.add(key)
      result.push(item)
    }
  }

  return result
}

export function diffBy<T>(
  diffFn: (item: T) => string,
  arr1: T[],
  arr2: T[],
): T[] {
  const seen = new Set<string>()
  const result: T[] = []

  for (const item of arr2) {
    seen.add(diffFn(item))
  }

  for (const item of arr1) {
    if (!seen.has(diffFn(item))) {
      result.push(item)
    }
  }

  return result
}

export function mergeArrays<TArr, TKey extends keyof TArr>(
  arr1: TArr[],
  arr2: TArr[],
  key: TKey,
) {
  const mergedArray = arr1.reduce(
    (acc, obj) => {
      // Check if the object already exists in the merged array
      const existingObj = acc.find((item) => item[key] === obj[key])
      if (!existingObj) {
        acc.push(obj) // Add the object if it doesn't exist
      }
      return acc
    },
    [...arr2],
  ) // Start with a copy of arr2

  return mergedArray
}

export const arrayToMap = <T extends object>(prop: keyof T, arr?: T[]) => {
  return new Map(
    (arr || []).map((item) => {
      return [item[prop], item]
    }),
  )
}

export function zipArrays<A, B>(a: A[], b: B[]): [A, B][] {
  return a.map((item, index) => [item, b[index]])
}

export function shuffleArray(arr: any[]) {
  const newArr = arr.slice()
  for (let i = newArr.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[rand]] = [newArr[rand], newArr[i]]
  }
  return newArr
}
