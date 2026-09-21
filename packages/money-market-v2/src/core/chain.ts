import type { Address } from "viem"
import { BaseError, ContractFunctionZeroDataError } from "viem"
import type { ZodType } from "zod"

import {
  ChainReadError,
  DecodeError,
  MarketNotDeployedError,
} from "@/core/errors"
import type { MarketDescriptor } from "@/types"

/**
 * Shared plumbing for every chain read in the package. Its whole job is to make
 * sure the three failure modes stay distinguishable (US-005): empty return data
 * means the registry points at nothing, any other transport failure is
 * retryable, and a payload that does not match its schema is a decode problem.
 *
 * No module holds transport state — the wagmi `Config` and the resolved market
 * descriptor are passed per call.
 */

/** viem reports empty return data as a nested `ContractFunctionZeroDataError`. */
const isZeroData = (error: unknown): boolean =>
  error instanceof BaseError &&
  error.walk((cause) => cause instanceof ContractFunctionZeroDataError) !== null

/** Runs one contract call, mapping its failures onto the package's errors. */
export const chainRead = async <T>(
  market: MarketDescriptor,
  address: Address,
  subject: string,
  read: () => Promise<T>,
): Promise<T> => {
  try {
    return await read()
  } catch (error) {
    if (isZeroData(error)) {
      throw new MarketNotDeployedError(market.market, address)
    }
    throw new ChainReadError(
      `Failed to read ${subject} for market ${market.market}`,
      error,
    )
  }
}

/** Validates a payload, and never lets the `ZodError` out. */
export const decode = <T>(
  schema: ZodType<T>,
  payload: unknown,
  subject: string,
): T => {
  const result = schema.safeParse(payload)
  if (!result.success) {
    throw new DecodeError(`Unexpected ${subject} payload`, result.error)
  }
  return result.data
}
