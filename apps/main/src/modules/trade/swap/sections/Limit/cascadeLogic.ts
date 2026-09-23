import Big from "big.js"

import { formatPrice } from "@/modules/trade/swap/lib/quotedPrice"

/** Last-two-wins cascade: `buy = sell × price`; lock keeps sell in the pair. */

export type FieldName = "sell" | "buy" | "price"
export type LastTwo = [FieldName, FieldName]
export type FieldValues = Readonly<Record<FieldName, string>>
export type MarketQuoteDirection = "sell" | "buy"
export const ALL_FIELDS: readonly FieldName[] = ["sell", "buy", "price"]

export const getDerived = ([a, b]: LastTwo): FieldName =>
  ALL_FIELDS.find((f) => f !== a && f !== b) ?? "price"

export const getMarketQuoteDirection = (
  lastTwo: LastTwo,
): MarketQuoteDirection => (getDerived(lastTwo) === "sell" ? "buy" : "sell")

export const updateLastTwoOnTouch = (
  prev: LastTwo,
  touched: FieldName,
  isLocked: boolean,
): LastTwo => {
  if (isLocked) {
    if (touched === "sell")
      return ["sell", prev.find((f) => f !== "sell") ?? "price"]
    return [touched, "sell"]
  }
  if (prev[0] === touched) return prev
  return [touched, prev[0]]
}

export const lockSellIntoLastTwo = (prev: LastTwo): LastTwo =>
  prev.includes("sell") ? prev : [prev[0], "sell"]

const nonNegative = (raw: string): Big | null => {
  try {
    const value = new Big(raw.trim() || "0")
    return value.gte(0) ? value : null
  } catch {
    return null
  }
}

const positive = (raw: string): Big | null => {
  const value = nonNegative(raw)
  return value !== null && value.gt(0) ? value : null
}

export const computeDerived = (
  derived: FieldName,
  values: FieldValues,
): string | null => {
  const sell = positive(values.sell)
  const buy = positive(values.buy)
  const price = nonNegative(values.price)

  if (price === null) return null

  if (derived === "buy") {
    if (!sell) return null
    if (price.eq(0)) return ""
    return formatPrice(sell.times(price))
  }
  if (derived === "sell") {
    if (!buy || price.eq(0)) return null
    return formatPrice(buy.div(price))
  }
  return sell && buy ? formatPrice(buy.div(sell)) : null
}

const repairCandidate = (
  lastTwo: LastTwo,
  values: FieldValues,
  touched?: FieldName,
): LastTwo => {
  const [a, b] = lastTwo
  const derived = getDerived(lastTwo)

  if (computeDerived(derived, values) !== null) return lastTwo
  if (derived !== "price" || positive(values.price) === null) return lastTwo
  if (a === "price" || b === "price") return lastTwo

  if (touched && touched !== "price") return [touched, "price"]
  if (positive(values.sell) && !positive(values.buy)) return ["sell", "price"]
  if (positive(values.buy) && !positive(values.sell)) return ["buy", "price"]

  return lastTwo
}

export const repairLastTwo = (
  lastTwo: LastTwo,
  values: FieldValues,
  touched?: FieldName,
  isLocked = false,
): LastTwo => {
  const repaired = repairCandidate(lastTwo, values, touched)
  if (isLocked && getDerived(repaired) === "sell") return lastTwo
  return repaired
}
