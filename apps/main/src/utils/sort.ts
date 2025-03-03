export type Compare<T> = (a: T, b: T) => number

type SortByArgs<T, TProp> = {
  readonly select: (value: T) => TProp
  readonly compare: Compare<TProp>
}

export const sortBy =
  <T, TProp>({ select, compare }: SortByArgs<T, TProp>): Compare<T> =>
  (a, b): number => {
    const aProp = select(a)
    const bProp = select(b)

    return compare(aProp, bProp)
  }

export const numerically: Compare<number> = (a, b) => a - b

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
