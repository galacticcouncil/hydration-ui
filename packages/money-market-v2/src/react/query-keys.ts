import { Address } from "viem"

import { CustomMarket } from "@/types"

/**
 * The package's cache keys, as one hierarchy under the root `"mm"`.
 *
 * Every level is built from the level above it, so every level is a valid
 * invalidation prefix: `moneyMarketKeys.market(m)` invalidates everything read
 * for one market, `moneyMarketKeys.all` everything v2 has cached.
 *
 * The market comes before the discriminator for exactly that reason — a key
 * shaped `["mm", "reserves", market]` would make "one market" unreachable as a
 * prefix and force consumers to invalidate per read kind instead.
 *
 * A timestamp is never part of a key (ADR-0004): the tick that re-derives
 * values is not a cache dimension, and putting it in a key would refetch the
 * chain every tick.
 *
 * The per-user levels accept `undefined` because a hook cannot be called
 * conditionally: with no wallet connected there is still a key, it is just one
 * that is never fetched. Keeping it distinct from any real user's key is what
 * stops a connect from reading the not-connected entry.
 */
export const moneyMarketKeys = {
  all: ["mm"] as const,

  market: (market: CustomMarket) => [...moneyMarketKeys.all, market] as const,

  reserves: (market: CustomMarket) =>
    [...moneyMarketKeys.market(market), "reserves"] as const,

  hollar: (market: CustomMarket) =>
    [...moneyMarketKeys.market(market), "hollar"] as const,

  positions: (market: CustomMarket, user: Address | undefined) =>
    [...moneyMarketKeys.market(market), "positions", user] as const,

  balances: (market: CustomMarket, user: Address | undefined) =>
    [...moneyMarketKeys.market(market), "balances", user] as const,
} as const
