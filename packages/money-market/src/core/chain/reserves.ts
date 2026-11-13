import type { Config } from "@wagmi/core"
import { readContract } from "@wagmi/core"

import { uiIncentiveDataProviderAbi, uiPoolDataProviderAbi } from "@/core/abi"
import { chainRead, decode } from "@/core/chain/read"
import {
  reservesDataSchema,
  reservesIncentivesDataSchema,
} from "@/core/chain/schema"
import type { MarketDescriptor, MarketReserves } from "@/types"

/**
 * Reads everything a market says about its reserves: the reserve list, the base
 * currency the market prices in, and the reward emissions configured against
 * each reserve. Incentives are part of this read rather than a separate one,
 * because a reserve summary is never useful without them and two reads would
 * let them drift a block apart.
 *
 * Transport comes in per call — the module keeps no client and no market.
 * A market with no incentives configured returns an empty `incentives` array;
 * that is an ordinary result, not a failure.
 */
export const readReserves = async (
  config: Config,
  market: MarketDescriptor,
): Promise<MarketReserves> => {
  const { UI_POOL_DATA_PROVIDER, UI_INCENTIVE_DATA_PROVIDER } = market.addresses
  const provider = market.addresses.POOL_ADDRESSES_PROVIDER

  const [reservesData, incentivesData] = await Promise.all([
    chainRead(market, UI_POOL_DATA_PROVIDER, "reserves", () =>
      readContract(config, {
        address: UI_POOL_DATA_PROVIDER,
        abi: uiPoolDataProviderAbi,
        functionName: "getReservesData",
        args: [provider],
      }),
    ),
    chainRead(market, UI_INCENTIVE_DATA_PROVIDER, "reserve incentives", () =>
      readContract(config, {
        address: UI_INCENTIVE_DATA_PROVIDER,
        abi: uiIncentiveDataProviderAbi,
        functionName: "getReservesIncentivesData",
        args: [provider],
      }),
    ),
  ])

  const [reserves, baseCurrency] = decode(
    reservesDataSchema,
    reservesData,
    "reserves",
  )

  return {
    reserves,
    baseCurrency,
    incentives: decode(
      reservesIncentivesDataSchema,
      incentivesData,
      "reserve incentives",
    ),
  }
}
