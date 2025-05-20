import { KeyOfType } from "@galacticcouncil/utils/src/types"
import Big from "big.js"

import { TAssetData } from "@/api/assets"

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

export const sortAssets = <T extends TAssetData>(
  assets: Array<T>,
  balanceKey: Extract<KeyOfType<T, string>, string>,
  firstAssetId?: string,
) => {
  const tickerOrder = [
    "HDX",
    "DOT",
    "USDC",
    "USDT",
    "IBTC",
    "VDOT",
    "WETH",
    "WBTC",
  ]
  const getTickerIndex = (ticker: string) => {
    const index = tickerOrder.indexOf(ticker.toUpperCase())
    return index === -1 ? Infinity : index
  }

  return [...assets].sort((a, b) => {
    if (firstAssetId) {
      if (a.id === firstAssetId) return -1
      if (b.id === firstAssetId) return 1
    }
    const balanceA = a[balanceKey] as string
    const balanceB = b[balanceKey] as string

    if (!balanceA || !balanceB) {
      if (!balanceA && balanceB) return 1
      if (balanceA && !balanceB) return -1

      if (a.symbol && b.symbol) return a.symbol.localeCompare(b.symbol)
    }

    if (balanceB === "0" && balanceA === "0") {
      const tickerIndexA = getTickerIndex(a.symbol)
      const tickerIndexB = getTickerIndex(b.symbol)

      if (tickerIndexA === tickerIndexB) {
        return a.symbol.localeCompare(b.symbol)
      } else {
        return tickerIndexA - tickerIndexB
      }
    }

    return Big(balanceB).minus(balanceA).toNumber()
  })
}
