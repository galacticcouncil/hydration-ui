import {
  activeAssetDataQuery,
  clearinghouseStateQuery,
  maxBuilderFeeQuery,
  metaAndAssetCtxsQuery,
  openOrdersQuery,
  spotClearinghouseStateQuery,
  spotMetaAndAssetCtxsQuery,
  userRoleQuery,
} from "@galacticcouncil/hyperliquid/queries"
import { isEthereumSigner, useWallet } from "@galacticcouncil/web3-connect"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { HYPERLIQUID } from "@/config/hyperliquid"

export type MarketType = "perp" | "spot"

export type PerpsMarket = {
  type: MarketType
  /** Display and order symbol — `BTC` for perps, `HYPE/USDC` for spot. */
  symbol: string
  /**
   * Wire name used by candle/book endpoints. Same as `symbol` for perps, but
   * spot pairs must be addressed as `@107` — the friendly name 500s.
   */
  wire: string
  maxLeverage: number
  markPx: string
  funding: string
  openInterest: string
  oraclePx: string
  dayNtlVlm: string
  prevDayPx: string
}

/**
 * Hyperliquid identifies accounts by ECDSA signature, so only an EVM signer
 * has an account there. A Substrate account's derived H160 is a real address
 * on Hydration's EVM but nothing can sign for it, and querying Hyperliquid
 * with it would only ever show an empty account that looks like the user's.
 * Every account hook keys off this, so those users see nothing at all.
 */
export const usePerpsAddress = () => {
  const wallet = useWallet()
  const signer = wallet?.signer

  return isEthereumSigner(signer) ? signer.address : ""
}

export const usePerpsMarkets = () => {
  const { data, isLoading } = useQuery(
    metaAndAssetCtxsQuery(HYPERLIQUID.isTestnet),
  )

  const markets = useMemo<PerpsMarket[]>(() => {
    if (!data) return []

    const [meta, ctxs] = data

    return meta.universe.map((asset, index) => ({
      type: "perp" as const,
      symbol: asset.name,
      wire: asset.name,
      maxLeverage: asset.maxLeverage,
      markPx: ctxs[index]?.markPx ?? "0",
      funding: ctxs[index]?.funding ?? "0",
      openInterest: ctxs[index]?.openInterest ?? "0",
      oraclePx: ctxs[index]?.oraclePx ?? "0",
      dayNtlVlm: ctxs[index]?.dayNtlVlm ?? "0",
      prevDayPx: ctxs[index]?.prevDayPx ?? "0",
    }))
  }, [data])

  return { markets, isLoading }
}

export const usePerpsAccount = () => {
  const address = usePerpsAddress()

  return useQuery(clearinghouseStateQuery(HYPERLIQUID.isTestnet, address))
}

/**
 * An address only exists on Hyperliquid once it has deposited. Until then
 * every action, the builder approval included, is rejected with an opaque
 * error, so the UI has to know before it offers the approval.
 */
export const useHyperliquidAccount = () => {
  const address = usePerpsAddress()
  const query = useQuery(userRoleQuery(HYPERLIQUID.isTestnet, address))

  // A failed lookup must not block the flow — the approval itself reports
  // a missing account clearly enough if it comes to that.
  return {
    ...query,
    exists: query.isError || (!!query.data && query.data.role !== "missing"),
  }
}

/** The account's current leverage and tradable balance for one perp market. */
export const useActiveAssetData = (coin: string, enabled = true) => {
  const address = usePerpsAddress()
  const options = activeAssetDataQuery(HYPERLIQUID.isTestnet, address, coin)

  return useQuery({ ...options, enabled: enabled && options.enabled })
}

/**
 * Hyperliquid returns 0 when the user has never approved our builder address,
 * which is the gate the order form sits behind.
 */
export const useBuilderApproval = () => {
  const address = usePerpsAddress()

  const query = useQuery(
    maxBuilderFeeQuery(HYPERLIQUID.isTestnet, address, HYPERLIQUID.builder),
  )

  return { ...query, isApproved: (query.data ?? 0) >= HYPERLIQUID.fee }
}

export const useOpenOrders = () => {
  const address = usePerpsAddress()

  return useQuery(openOrdersQuery(HYPERLIQUID.isTestnet, address))
}

export const useSpotMarkets = () => {
  const { data, isLoading } = useQuery(
    spotMetaAndAssetCtxsQuery(HYPERLIQUID.isTestnet),
  )

  const markets = useMemo<PerpsMarket[]>(() => {
    if (!data) return []

    const [meta, ctxs] = data
    // Spot contexts are keyed by wire name, not array position.
    const byCoin = new Map(ctxs.map((ctx) => [ctx.coin, ctx]))

    return (
      meta.universe
        .map((pair) => {
          const base = meta.tokens[pair.tokens[0] ?? -1]?.name
          const quote = meta.tokens[pair.tokens[1] ?? -1]?.name

          const ctx = byCoin.get(pair.name)

          return {
            type: "spot" as const,
            symbol: base && quote ? `${base}/${quote}` : pair.name,
            wire: pair.name,
            maxLeverage: 1,
            markPx: ctx?.midPx ?? "",
            funding: "0",
            openInterest: "0",
            oraclePx: ctx?.markPx ?? "0",
            dayNtlVlm: ctx?.dayNtlVlm ?? "0",
            prevDayPx: ctx?.prevDayPx ?? "0",
          }
        })
        // Unquoted pairs have no mid and cannot be priced in the ticket.
        .filter((market) => market.symbol.endsWith("/USDC") && market.markPx)
    )
  }, [data])

  return { markets, isLoading }
}

export const useMarkets = (type: MarketType) => {
  const perps = usePerpsMarkets()
  const spot = useSpotMarkets()

  return type === "spot" ? spot : perps
}

/** All non-zero spot token balances for the connected account. */
export const useSpotBalances = () => {
  const address = usePerpsAddress()
  const { data, isLoading } = useQuery(
    spotClearinghouseStateQuery(HYPERLIQUID.isTestnet, address),
  )

  const balances = useMemo(
    () => (data?.balances ?? []).filter((b) => Number(b.total) > 0),
    [data],
  )

  return { balances, isLoading }
}

/** Both universes together, ordered by 24h volume like Hyperliquid's own list. */
export const useAllMarkets = () => {
  const perps = usePerpsMarkets()
  const spot = useSpotMarkets()

  const markets = useMemo(
    () =>
      [...perps.markets, ...spot.markets].sort(
        (a, b) => Number(b.dayNtlVlm) - Number(a.dayNtlVlm),
      ),
    [perps.markets, spot.markets],
  )

  return { markets, isLoading: perps.isLoading || spot.isLoading }
}
