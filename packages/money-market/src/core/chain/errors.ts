import type { Address } from "viem"
import type { ZodError } from "zod"

import type { CustomMarket } from "@/types"

/**
 * Renders a zod issue path the way a reader would write it: `reserves[0].decimals`.
 */
const formatPath = (segments: ReadonlyArray<PropertyKey>): string =>
  segments.reduce<string>((path, segment) => {
    if (typeof segment === "number") return `${path}[${segment}]`
    return path ? `${path}.${String(segment)}` : String(segment)
  }, "")

/**
 * A contract call returned empty data, which means nothing is deployed at the
 * address the registry names for this market.
 */
export class MarketNotDeployedError extends Error {
  readonly name = "MarketNotDeployedError"

  constructor(
    readonly market: CustomMarket,
    readonly address: Address,
  ) {
    super(`No contract deployed at ${address} for market ${market}`)
  }
}

/**
 * The transport failed. Retrying is reasonable; the underlying failure is the
 * `cause`.
 */
export class ChainReadError extends Error {
  readonly name = "ChainReadError"

  constructor(message: string, cause: unknown) {
    super(message, { cause })
  }
}

/**
 * A payload did not match its schema. Wraps the `ZodError` as `cause` so no zod
 * type reaches a consumer, and surfaces the first failing field path.
 */
export class DecodeError extends Error {
  readonly name = "DecodeError"

  /** Path of the first failing field, empty when the whole payload failed. */
  readonly path: string

  constructor(message: string, cause: ZodError) {
    const path = formatPath(cause.issues[0]?.path ?? [])
    super(path ? `${message} at ${path}` : message, { cause })
    this.path = path
  }
}
