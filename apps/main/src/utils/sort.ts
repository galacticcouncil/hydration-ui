import { KeyOfType } from "@galacticcouncil/utils"
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

export const chronologically: Compare<Date> = (a, b) =>
  a.valueOf() - b.valueOf()
export const chronologicallyDesc = descending(chronologically)

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

export const nullLast =
  <T>(compare: Compare<T>): Compare<T | null> =>
  (a, b) => {
    if (a === null) {
      return 1
    }
    if (b === null) {
      return -1
    }

    return compare(a, b)
  }

export const naturally: Compare<string> = (a, b) => a.localeCompare(b)
export const naturallyDesc = descending(naturally)

export const logically: Compare<boolean> = (a, b) =>
  numerically(Number(a), Number(b))

type SortAssetsOptions = {
  firstAssetId?: string
  tickerOrder?: string[]
  lowPriorityAssetIds?: string[]
  highPriorityAssetIds?: string[]
  search?: string
}

const SORT_ASSETS_TICKER_ORDER = [
  "HDX",
  "DOT",
  "USDC",
  "USDT",
  "IBTC",
  "VDOT",
  "WETH",
  "WBTC",
]

const MATCH_SCORE_MAX = 100

const getMatchScore = (text: string, searchTerm: string): number => {
  if (!searchTerm) return 0
  const lowerText = text.toLowerCase()
  const lowerSearch = searchTerm.toLowerCase()

  if (lowerText === lowerSearch) {
    return MATCH_SCORE_MAX
  }

  // Text starts with search term - difference is extra characters after the match
  if (lowerText.startsWith(lowerSearch)) {
    const diffChar = lowerText.length - lowerSearch.length
    return Math.max(0, MATCH_SCORE_MAX - diffChar)
  }

  // Search term starts with text (e.g., "ethe" starts with "eth") - difference is extra characters in search
  if (lowerSearch.startsWith(lowerText)) {
    const diffChar = lowerSearch.length - lowerText.length
    return Math.max(0, MATCH_SCORE_MAX - diffChar)
  }

  // Text contains search term - difference is total extra characters
  if (lowerText.includes(lowerSearch)) {
    const diffChar = lowerText.length - lowerSearch.length
    return Math.max(0, MATCH_SCORE_MAX - diffChar)
  }

  // Search term contains text (e.g., "ethe" contains "eth") - difference is extra characters in search
  if (lowerSearch.includes(lowerText)) {
    const diffChar = lowerSearch.length - lowerText.length
    return Math.max(0, MATCH_SCORE_MAX - diffChar)
  }

  return 0
}

export const sortAssets = <T extends TAssetData>(
  assets: Array<T>,
  balanceKey: Extract<KeyOfType<T, string>, string>,
  options?: SortAssetsOptions,
) => {
  const {
    firstAssetId,
    lowPriorityAssetIds = [],
    highPriorityAssetIds = [],
    tickerOrder = SORT_ASSETS_TICKER_ORDER,
    search,
  } = options ?? {}

  const getTickerIndex = (ticker: string) => {
    // include aTokens of assets in ticker order
    const formattedTicker = ticker.startsWith("a") ? ticker.slice(1) : ticker
    const index = tickerOrder.indexOf(formattedTicker.toUpperCase())
    return index === -1 ? Infinity : index
  }

  const isLowPriority = (id: string) => lowPriorityAssetIds.includes(id)
  const isHighPriority = (id: string) => highPriorityAssetIds.includes(id)

  return [...assets].sort((a, b) => {
    if (search?.length) {
      const symbolScoreA = getMatchScore(a.symbol, search)
      const symbolScoreB = getMatchScore(b.symbol, search)

      if (symbolScoreA === 0 && symbolScoreB === 0) {
        const nameScoreA = getMatchScore(a.name, search)
        const nameScoreB = getMatchScore(b.name, search)

        const nameScoreDiff = nameScoreB - nameScoreA
        if (nameScoreDiff !== 0) {
          return nameScoreDiff
        }
      } else {
        const symbolScoreDiff = symbolScoreB - symbolScoreA

        if (symbolScoreDiff !== 0) {
          return symbolScoreDiff
        }
      }
    }
    // 1. Prioritize first asset if provided
    if (a.id === firstAssetId) return -1
    if (b.id === firstAssetId) return 1

    const balanceA = a[balanceKey] as string
    const balanceB = b[balanceKey] as string

    const hasBalanceA = balanceA && Big(balanceA).gt(0)
    const hasBalanceB = balanceB && Big(balanceB).gt(0)

    // 2. Assets with balance first, high priority first, low priority last (if both have balance)
    if (hasBalanceA && hasBalanceB) {
      const isHighPrioA = isHighPriority(a.id)
      const isHighPrioB = isHighPriority(b.id)
      const isLowPrioA = isLowPriority(a.id)
      const isLowPrioB = isLowPriority(b.id)

      if (isHighPrioA !== isHighPrioB) return isHighPrioA ? -1 : 1
      if (isLowPrioA !== isLowPrioB) return isLowPrioA ? 1 : -1
      return Big(balanceB).minus(balanceA).toNumber()
    }

    // 3. One has balance, the other doesn't
    if (hasBalanceA !== hasBalanceB) return hasBalanceA ? -1 : 1

    // 4. Both have no balance → prioritize high priority, then non-low-priority
    const isHighPrioA = isHighPriority(a.id)
    const isHighPrioB = isHighPriority(b.id)
    const isLowPrioA = isLowPriority(a.id)
    const isLowPrioB = isLowPriority(b.id)

    if (isHighPrioA !== isHighPrioB) return isHighPrioA ? -1 : 1
    if (isLowPrioA !== isLowPrioB) return isLowPrioA ? 1 : -1

    // 5. Use ticker order
    const tickerIndexA = getTickerIndex(a.symbol)
    const tickerIndexB = getTickerIndex(b.symbol)

    if (tickerIndexA !== tickerIndexB) {
      return tickerIndexA - tickerIndexB
    }

    // 6. Fallback: alphabetical
    return a.symbol.localeCompare(b.symbol)
  })
}
