import { isBigInt } from "remeda"

export const safeStringify = (value: unknown, format?: boolean) => {
  if (!value) return value?.toString() ?? ""

  return JSON.stringify(
    value,
    (_, value) => (isBigInt(value) ? `bigint:${value.toString()}` : value),
    format ? 2 : undefined,
  )
}

export const safeParse = <T = unknown>(value: string): T => {
  return JSON.parse(value, (_, value) => {
    if (typeof value === "string") {
      if (value.startsWith("bigint:")) return BigInt(value.slice(7))
    }
    return value
  })
}
