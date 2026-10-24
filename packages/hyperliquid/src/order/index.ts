import { AbstractWallet } from "@nktkas/hyperliquid/signing"
import {
  formatPrice,
  formatSize,
  SymbolConverter,
} from "@nktkas/hyperliquid/utils"
import { formatUnits, parseUnits } from "viem"

import { getExchangeClient, getTransport } from "@/client"
import { DEFAULT_MARKET_SLIPPAGE_PCT, MAX_BUILDER_FEE_PERP } from "@/config"

/** Spot symbols are pairs (`HYPE/USDC`); perp symbols are bare (`HYPE`). */
export const isSpotSymbol = (symbol: string) => symbol.includes("/")

export type BuilderConfig = {
  address: string
  /** Fee in tenths of a basis point. */
  fee: number
}

/** `FrontendMarket` is how a UI submits a market order without pricing slippage itself. */
export type OrderTif = "Gtc" | "Ioc" | "Alo" | "FrontendMarket"

export type PlaceOrderParams = {
  symbol: string
  isBuy: boolean
  /** Size in base units, e.g. "0.01" for BTC. */
  size: string
  /**
   * Limit price. For `FrontendMarket` orders it is the reference (mark)
   * price, and the limit actually sent sits `slippage` percent beyond it.
   */
  price: string
  tif?: OrderTif
  reduceOnly?: boolean
  /** Worst acceptable market-order price, as a percent from `price`. */
  slippage?: number
}

export type OrderClient = Awaited<ReturnType<typeof createOrderClient>>

const converters = new Map<boolean, Promise<SymbolConverter>>()

/**
 * Symbol tables are loaded once per network and shared by every order client.
 * Building one costs two info requests, and the universe changes rarely.
 */
export const getSymbolConverter = (isTestnet: boolean) => {
  const cached = converters.get(isTestnet)

  if (cached) return cached

  const converter = SymbolConverter.create({
    transport: getTransport(isTestnet),
  })
  converters.set(isTestnet, converter)
  // A failed load is not kept, so the next call retries.
  converter.catch(() => converters.delete(isTestnet))

  return converter
}

const PRICE_DECIMALS = 18
const BPS = 10_000n

/**
 * Hyperliquid has no true market order: a "market" order is an IoC limit
 * order, and whatever the book cannot fill inside the limit is cancelled. So
 * the limit is set `slippage` percent beyond the reference price — above it
 * for a buy, below it for a sell. Fills still happen at the book's prices;
 * the limit only bounds a thin or moving book.
 */
export const marketLimitPrice = (
  price: string,
  isBuy: boolean,
  slippage: number,
) => {
  const bps = BigInt(Math.round(slippage * 100))
  const factor = isBuy ? BPS + bps : BPS - bps
  const limit = (parseUnits(price, PRICE_DECIMALS) * factor) / BPS

  return formatUnits(limit, PRICE_DECIMALS)
}

/**
 * Wraps the exchange client so every order action carries our builder code.
 * Orders without it fill normally and simply earn nothing, and neither the SDK
 * nor the API warns about it — so this is the only place allowed to build
 * order actions.
 */
export const createOrderClient = async (
  isTestnet: boolean,
  wallet: AbstractWallet,
  builder: BuilderConfig,
) => {
  // The perp cap (0.1%) is the stricter of the two, so a fee that clears it is
  // valid on spot too. Note Hyperliquid only charges builder fees on the sell
  // side of spot — buys carry the field but earn nothing.
  if (builder.fee > MAX_BUILDER_FEE_PERP) {
    throw new Error(
      `Builder fee ${builder.fee} exceeds the perp cap of ${MAX_BUILDER_FEE_PERP}`,
    )
  }

  const exchange = getExchangeClient(isTestnet, wallet)
  const symbols = await getSymbolConverter(isTestnet)

  const lookup = (symbol: string) => {
    const assetId = symbols.getAssetId(symbol)
    const szDecimals = symbols.getSzDecimals(symbol)

    return assetId === undefined || szDecimals === undefined
      ? undefined
      : { assetId, szDecimals }
  }

  const resolve = async (symbol: string) => {
    const known = lookup(symbol)

    if (known) return known

    // A symbol missing from the table may have listed since it was loaded.
    await symbols.reload()
    const listed = lookup(symbol)

    if (!listed) throw new Error(`Unknown Hyperliquid symbol: ${symbol}`)

    return listed
  }

  return {
    placeOrder: async ({
      symbol,
      isBuy,
      size,
      price,
      tif = "Gtc",
      reduceOnly = false,
      slippage = DEFAULT_MARKET_SLIPPAGE_PCT,
    }: PlaceOrderParams) => {
      const { assetId, szDecimals } = await resolve(symbol)
      const limitPx =
        tif === "FrontendMarket"
          ? marketLimitPrice(price, isBuy, slippage)
          : price

      return exchange.order({
        orders: [
          {
            a: assetId,
            b: isBuy,
            p: formatPrice(
              limitPx,
              szDecimals,
              isSpotSymbol(symbol) ? "spot" : "perp",
            ),
            s: formatSize(size, szDecimals),
            r: reduceOnly,
            t: { limit: { tif } },
          },
        ],
        grouping: "na",
        builder: { b: builder.address as `0x${string}`, f: builder.fee },
      })
    },

    /** Leverage is per asset and persists on the account until changed. */
    setLeverage: async (symbol: string, leverage: number, isCross = true) =>
      exchange.updateLeverage({
        asset: (await resolve(symbol)).assetId,
        isCross,
        leverage,
      }),

    cancelOrder: async (symbol: string, orderId: number) =>
      exchange.cancel({
        cancels: [{ a: (await resolve(symbol)).assetId, o: orderId }],
      }),
  }
}
