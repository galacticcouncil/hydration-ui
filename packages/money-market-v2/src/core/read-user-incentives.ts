import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"
import type { Address } from "viem"

import { uiIncentiveDataProviderAbi } from "@/core/abi"
import { chainRead, decode } from "@/core/chain"
import { userReservesIncentivesDataSchema } from "@/core/schema"
import type { MarketDescriptor, UserReserveIncentives } from "@/types"

/**
 * Reads one user's reward state for every incentivised reserve of a market:
 * the reward index each of their positions was last settled at, and what the
 * controller has already booked for them.
 *
 * It is its own read for the same reason `readPositions` is — rewards are a
 * user-scoped concern and must not be able to take the reserve list down with
 * them. A user with no reward state decodes to an empty array; that is the
 * ordinary case for an address that has never used an incentivised reserve,
 * and for a market with no incentives configured at all.
 */
export const readUserIncentives = async (
  config: Config,
  market: MarketDescriptor,
  user: Address,
): Promise<UserReserveIncentives[]> => {
  const { UI_INCENTIVE_DATA_PROVIDER, POOL_ADDRESSES_PROVIDER } =
    market.addresses

  const payload = await chainRead(
    market,
    UI_INCENTIVE_DATA_PROVIDER,
    "user incentives",
    () =>
      readContract(config, {
        address: UI_INCENTIVE_DATA_PROVIDER,
        abi: uiIncentiveDataProviderAbi,
        functionName: "getUserReservesIncentivesData",
        args: [POOL_ADDRESSES_PROVIDER, user],
      }),
  )

  return decode(userReservesIncentivesDataSchema, payload, "user incentives")
}
