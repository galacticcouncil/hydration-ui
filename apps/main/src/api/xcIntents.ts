import {
  createXcIntents,
  TwapParams,
  XcIntentsClient,
} from "@galacticcouncil/xc-intents"
import { queryOptions } from "@tanstack/react-query"
import { millisecondsInMinute, millisecondsInSecond } from "date-fns/constants"
import { useMemo } from "react"
import z from "zod/v4"

import { useRpcProvider } from "@/providers/rpcProvider"

// Proxied to scan v2 (netlify.toml, vite.config.ts): the gateway sends no CORS headers.
export const XC_INTENTS_SCAN_URL = "/scan-v2"

export const useXcIntentsClient = () => {
  const { sdk } = useRpcProvider()

  return useMemo(
    () => createXcIntents({ sdk, scanUrl: XC_INTENTS_SCAN_URL }),
    [sdk],
  )
}

export const XC_INTENTS_QUERY_KEY_PREFIX = "xcIntents"

export const xcIntentsQueryKeys = {
  destinations: () => [XC_INTENTS_QUERY_KEY_PREFIX, "destinations"],
  twap: (params: TwapParams) => [
    XC_INTENTS_QUERY_KEY_PREFIX,
    "twap",
    params.assetIn,
    params.amountIn.toString(),
    params.destination,
    params.recipient,
    params.refundTo,
    params.tranches,
    params.period,
    params.minDelivery?.toString(),
    params.slippage,
  ],
  trade: (authPath: string) => [XC_INTENTS_QUERY_KEY_PREFIX, "trade", authPath],
  ownerOrders: (owner: string) => [
    XC_INTENTS_QUERY_KEY_PREFIX,
    "ownerOrders",
    owner.toLowerCase(),
  ],
}

// xc-scan v2 payloads: amounts are decimal strings, `*_at` unix ms, `deadline` / `settle_at` unix s.

const scanTxSchema = z.object({
  txHash: z.string(),
  /** Hydration `<block>-<index>`; the published txHash carries a log index */
  extrinsic: z.string().nullish(),
  /** Unix ms */
  blockTimestamp: z.number().nullish(),
})

const scanAssetMetaSchema = z.object({
  symbol: z.string(),
  decimals: z.number(),
})

export const xcScanTradeSchema = z.object({
  auth_path: z.string(),
  /** Packed terms, hex */
  terms: z.string(),
  status: z.enum(["pending", "closing", "completed", "refunded", "expired"]),
  owner: z.string(),
  recipient: z.string(),
  refund_to: z.string(),
  destination_asset: z.string(),
  deadline: z.string(),
  /** Destination units that reached the recipient's chain */
  received: z.string(),
  /** Destination units swapped but not paid out yet; null when NEAR is unreadable */
  held: z.string().nullish(),
  settle_at: z.string().nullish(),
})

export const xcScanOrderSchema = z.object({
  seq: z.string(),
  state: z.enum(["published", "forwarded", "swapped"]),
  auth_path: z.string(),
  /** ICE intent id */
  intent_id: z.string().nullish(),
  /** Hydration-side amount of this order */
  amount_in: z.string().nullish(),
  asset_in_meta: scanAssetMetaSchema.nullish(),
  published: scanTxSchema.nullish(),
})

export const xcScanPayoutSchema = z.object({
  id: z.string(),
  /** delivered: destination units to the recipient; refunded: wei to refundTo */
  state: z.enum(["delivered", "refunded"]),
  amount: z.string(),
  /** Net of bridge and miner fees; set once the withdrawal is submitted */
  dest_amount: z.string().nullish(),
  /** ZEC / BTC tx */
  dest_tx: z.string().nullish(),
  /** Null while the withdrawal confirms */
  dest_at: z.string().nullish(),
  /** NEAR tx */
  signed: scanTxSchema.nullish(),
})

export const xcScanTradeDetailSchema = z.object({
  trade: xcScanTradeSchema,
  orders: z.array(xcScanOrderSchema),
  payouts: z.array(xcScanPayoutSchema),
})

export type XcScanTrade = z.infer<typeof xcScanTradeSchema>
export type XcScanTradeStatus = XcScanTrade["status"]
export type XcScanOrder = z.infer<typeof xcScanOrderSchema>
export type XcScanPayout = z.infer<typeof xcScanPayoutSchema>
export type XcScanTradeDetail = z.infer<typeof xcScanTradeDetailSchema>

const XC_TWAP_REFETCH_INTERVAL = 30 * millisecondsInSecond

const FINAL_TRADE_STATUSES: ReadonlyArray<XcScanTradeStatus> = [
  "completed",
  "refunded",
  "expired",
]

export const xcIntentsDestinationsQuery = (client: XcIntentsClient) =>
  queryOptions({
    queryKey: xcIntentsQueryKeys.destinations(),
    queryFn: () => client.destinations(),
    staleTime: millisecondsInMinute,
  })

export const xcTwapEstimateQuery = (
  client: XcIntentsClient,
  params: TwapParams,
) =>
  queryOptions({
    queryKey: xcIntentsQueryKeys.twap(params),
    queryFn: () => client.twap(params),
    refetchInterval: XC_TWAP_REFETCH_INTERVAL,
  })

/** One xc TWAP from scan; null until scan has indexed it. */
export const xcTwapTradeQuery = (client: XcIntentsClient, authPath: string) =>
  queryOptions({
    queryKey: xcIntentsQueryKeys.trade(authPath),
    queryFn: async () => {
      const trade = await client.trade(authPath)
      return trade ? xcScanTradeDetailSchema.parse(trade) : null
    },
    refetchInterval: ({ state }) =>
      state.data && FINAL_TRADE_STATUSES.includes(state.data.trade.status)
        ? false
        : XC_TWAP_REFETCH_INTERVAL,
  })

const ownerOrdersSchema = z.object({
  items: z.array(xcScanOrderSchema.pick({ intent_id: true, auth_path: true })),
})

/** The owner's xc orders from scan, as ICE intent id → auth path. */
export const xcTwapOwnerOrdersQuery = (owner: string) =>
  queryOptions({
    queryKey: xcIntentsQueryKeys.ownerOrders(owner),
    queryFn: async () => {
      // Single page of 1000 orders; accounts with more need paging
      const res = await fetch(
        `${XC_INTENTS_SCAN_URL}/orders?address=${owner.toLowerCase()}&limit=1000`,
      )
      if (!res.ok) {
        throw new Error(`Scan API error: ${res.status} ${res.statusText}`)
      }

      const body: unknown = await res.json()
      const { items } = ownerOrdersSchema.parse(body)

      return new Map(
        items.flatMap(({ intent_id, auth_path }) =>
          intent_id ? [[intent_id, auth_path] as const] : [],
        ),
      )
    },
    refetchInterval: millisecondsInMinute,
  })
