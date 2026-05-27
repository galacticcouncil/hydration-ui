import { Binary } from "polkadot-api"
import { isBigInt } from "remeda"

export const safeStringify = (value: unknown, format?: boolean) => {
  if (!value) return value?.toString() ?? ""

  return JSON.stringify(
    value,
    (_, value) => {
      if (value instanceof Uint8Array) {
        return Binary.toHex(value)
      }
      return isBigInt(value) ? `bigint:${value.toString()}` : value
    },
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
