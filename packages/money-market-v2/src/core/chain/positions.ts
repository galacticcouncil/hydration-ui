import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import type { Address } from "viem"

import { uiPoolDataProviderAbi } from "@/core/abi"
import { chainRead, decode } from "@/core/chain/read"
import { userReservesDataSchema } from "@/core/chain/schema"
import type { MarketDescriptor, MarketPositions } from "@/types"

/**
 * Reads what one user has supplied to and borrowed from each reserve of a
 * market, plus the e-mode category they have selected. Both come out of the
 * same contract call, so a position and the e-mode it is valued under can never
 * come from different blocks.
 *
 * This is deliberately a separate read from `readReserves`: a market's reserves
 * are public data and must still be shown when a user's positions cannot be
 * fetched, so the two must be able to fail independently. Never fold them into
 * one function, and never await one before the other.
 *
 * A user with no positions decodes to an empty array — that is the ordinary
 * not-yet-interacted case, not a failure.
 */
export const readPositions = async (
  config: Config,
  market: MarketDescriptor,
  user: Address,
): Promise<MarketPositions> => {
  const { UI_POOL_DATA_PROVIDER, POOL_ADDRESSES_PROVIDER } = market.addresses

  const payload = await chainRead(
    market,
    UI_POOL_DATA_PROVIDER,
    "positions",
    () =>
      readContract(config, {
        address: UI_POOL_DATA_PROVIDER,
        abi: uiPoolDataProviderAbi,
        functionName: "getUserReservesData",
        args: [POOL_ADDRESSES_PROVIDER, user],
      }),
  )

  const [positions, eModeCategoryId] = decode(
    userReservesDataSchema,
    payload,
    "positions",
  )

  return {
    user: user.toLowerCase() as Address,
    positions,
    eModeCategoryId,
  }
}
