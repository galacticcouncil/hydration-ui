import Big from "big.js"

export const descending =
  <T>(compare: Compare<T>): Compare<T> =>
  (a, b) =>
    compare(b, a)

export type Compare<T> = (a: T, b: T) => number

type SortByArgs<T, TProp> = {
  readonly select: (value: T) => TProp
  readonly compare: Compare<TProp>
  readonly desc?: boolean
}

export const sortBy =
  <T, TProp>({ select, compare, desc }: SortByArgs<T, TProp>): Compare<T> =>
  (a, b): number => {
    const aProp = select(a)
    const bProp = select(b)

    return desc ? compare(bProp, aProp) : compare(aProp, bProp)
  }

export const numerically: Compare<number> = (a, b) => a - b
export const numericallyDesc = descending(numerically)

export const numericallyBig: Compare<Big> = (a, b) => a.minus(b).toNumber()
export const numericallyBigDesc = descending(numericallyBig)

export const numericallyStr: Compare<string> = (a, b) =>
  numericallyBig(new Big(a), new Big(b))
export const numericallyStrDesc = descending(numericallyStr)

export const chronologicallyStr: Compare<string> = (a, b) =>
  new Date(a).valueOf() - new Date(b).valueOf()
export const chronologicallyStrDesc = descending(chronologicallyStr)

export const nullFirst =
  <T>(compare: Compare<T>): Compare<T | null> =>
  (a, b) => {
    if (a === null) {
      return -1
    }
    if (b === null) {
      return 1
    }

    return compare(a, b)
  }

export const naturally: Compare<string> = (a, b) => a.localeCompare(b)
export const naturallyDesc = descending(naturally)
