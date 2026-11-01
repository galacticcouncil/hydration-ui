import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"

import { hollarTokenAbi, poolAbi } from "@/core/abi"
import { normalize } from "@/core/big"
import { chainRead, decode } from "@/core/chain/read"
import {
  hollarFacilitatorSchema,
  poolReserveATokenSchema,
} from "@/core/chain/schema"
import { HOLLAR_DECIMALS } from "@/core/constants"
import type { HollarFacilitator, MarketDescriptor } from "@/types"

/**
 * Reads the market's Hollar facilitator bucket — how much Hollar the pool may
 * mint, and how much it has. The Hollar reserve's own borrow cap is unset, so
 * this is the only cap its borrowing has.
 *
 * The bucket is read off the Hollar token for the market's own Hollar aToken,
 * resolved from the pool. The UiGhoDataProvider can't be used: it takes no
 * pool argument and only ever reports the Hydration pool's bucket.
 *
 * It stands alone rather than riding on the reserve read: a failure here must
 * not take the reserve list down with it.
 */
export const readHollarFacilitator = async (
  config: Config,
  market: MarketDescriptor,
): Promise<HollarFacilitator> => {
  const { POOL, HOLLAR_TOKEN } = market.addresses

  const reserve = await chainRead(market, POOL, "Hollar reserve", () =>
    readContract(config, {
      address: POOL,
      abi: poolAbi,
      functionName: "getReserveData",
      args: [HOLLAR_TOKEN],
    }),
  )

  const { aTokenAddress } = decode(
    poolReserveATokenSchema,
    reserve,
    "Hollar reserve",
  )

  const payload = await chainRead(
    market,
    HOLLAR_TOKEN,
    "Hollar facilitator",
    () =>
      readContract(config, {
        address: HOLLAR_TOKEN,
        abi: hollarTokenAbi,
        functionName: "getFacilitatorBucket",
        args: [aTokenAddress],
      }),
  )

  const [capacity, level] = decode(
    hollarFacilitatorSchema,
    payload,
    "Hollar facilitator",
  )

  return {
    level: normalize(level, HOLLAR_DECIMALS),
    maxCapacity: normalize(capacity, HOLLAR_DECIMALS),
  }
}
