import { Config } from "@wagmi/core"
import { createContext, ReactNode, useContext, useMemo } from "react"

import { MarketDescriptor } from "@/types"

/** How often cached chain state is re-derived against a fresh timestamp. */
export const DEFAULT_TICK_INTERVAL = 60_000

/**
 * The transport and the market it addresses, held as one value.
 *
 * Pairing them is the only guard v2 has against reading the wrong network
 * (ADR-0010): mainnet and testnet are indistinguishable from the EVM side, so
 * there is nothing to verify at runtime. The provider makes the pairing once
 * and every hook takes it from here, which is why neither half can be defaulted
 * and why the `Config` is not allowed to come from anywhere else.
 */
export type MoneyMarketConnection = {
  config: Config
  market: MarketDescriptor
  /** Re-derivation interval in milliseconds. Never a refetch interval. */
  tickInterval: number
}

const Context = createContext<MoneyMarketConnection | null>(null)

export type MoneyMarketProviderProps = {
  config: Config
  market: MarketDescriptor
  /** Defaults to {@link DEFAULT_TICK_INTERVAL}. */
  tickInterval?: number
  children?: ReactNode
}

/**
 * Holds the connection for the hooks below it.
 *
 * It deliberately does not create a `QueryClient` — the app owns that, and a
 * second client here would give v2 its own cache that the app could not
 * invalidate after a transaction.
 */
export const MoneyMarketProvider = ({
  config,
  market,
  tickInterval = DEFAULT_TICK_INTERVAL,
  children,
}: MoneyMarketProviderProps) => {
  const value = useMemo(
    () => ({ config, market, tickInterval }),
    [config, market, tickInterval],
  )

  return <Context.Provider value={value}>{children}</Context.Provider>
}

export const useMoneyMarket = (): MoneyMarketConnection => {
  const connection = useContext(Context)

  if (!connection) {
    throw new Error(
      "useMoneyMarket must be used inside a MoneyMarketProvider — a hook has no transport or market without one.",
    )
  }

  return connection
}
