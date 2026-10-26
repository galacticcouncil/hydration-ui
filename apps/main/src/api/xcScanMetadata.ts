import { queryOptions } from "@tanstack/react-query"
import { hoursToMilliseconds } from "date-fns"
import * as z from "zod/v4"

import { queryXcScanMetadata } from "@/modules/xcm/history/xcScanStore"

const chainSchema = z.object({
  urn: z.string(),
  runtimeChain: z.string().optional(),
  chainTokens: z.array(z.string()).default([]),
  chainDecimals: z.array(z.number().int().min(0).max(255)).default([]),
})

const assetSchema = z.object({
  chainId: z.string(),
  id: z
    .union([z.string(), z.number().int().min(0).max(Number.MAX_SAFE_INTEGER)])
    .transform(String),
  symbol: z.string().optional(),
  decimals: z
    .union([z.number(), z.string().regex(/^\d+$/).transform(Number)])
    .pipe(z.number().int().min(0).max(255))
    .optional(),
})

const chainsResponseSchema = z.object({
  items: z.array(chainSchema),
  pageInfo: z.object({
    hasNextPage: z.boolean(),
    endCursor: z.string(),
  }),
})
const assetsResponseSchema = z.object({ items: z.array(assetSchema) })

export type XcScanChainMetadata = z.infer<typeof chainSchema>
export type XcScanAssetMetadata = z.infer<typeof assetSchema>
export type XcScanChains = Readonly<Record<string, XcScanChainMetadata>>
export type XcScanAssets = Readonly<Record<string, XcScanAssetMetadata>>

export const xcScanChainsQuery = () =>
  queryOptions({
    queryKey: ["xcscanMetadata", "chains"],
    staleTime: hoursToMilliseconds(24),
    retry: 1,
    queryFn: async ({ signal }): Promise<XcScanChains> => {
      const chains: Record<string, XcScanChainMetadata> = {}
      const seenCursors = new Set<string>()
      let cursor: string | undefined
      do {
        const response = chainsResponseSchema.parse(
          await queryXcScanMetadata(
            {
              args: { op: "chains.list" },
              pagination: { limit: 100, cursor },
            },
            signal,
          ),
        )
        for (const chain of response.items) chains[chain.urn] = chain
        if (!response.pageInfo.hasNextPage) return chains
        const next = response.pageInfo.endCursor
        if (!next || seenCursors.has(next)) {
          throw new Error("XCScan metadata pagination did not advance")
        }
        seenCursors.add(next)
        cursor = next
      } while (cursor)
      return chains
    },
  })

export const xcScanAssetsQuery = (assetKeys: readonly string[]) => {
  const keys = [
    ...new Set(
      assetKeys
        .filter((key) => /^urn:ocn:[^:|]+:[^|]+\|[^|]*$/.test(key))
        .map((key) => (key.endsWith("|") ? `${key}native` : key)),
    ),
  ].sort()
  return queryOptions({
    queryKey: ["xcscanMetadata", "assets", keys],
    enabled: keys.length > 0,
    staleTime: hoursToMilliseconds(24),
    retry: 1,
    queryFn: async ({ signal }): Promise<XcScanAssets> => {
      if (!keys.length) return {}
      const networks = new Map<string, string[]>()
      for (const key of keys) {
        const [network, asset] = key.split("|")
        if (!network || asset === undefined) continue
        const assets = networks.get(network) ?? []
        assets.push(asset || "native")
        networks.set(network, assets)
      }
      const response = assetsResponseSchema.parse(
        await queryXcScanMetadata(
          {
            args: {
              op: "assets",
              criteria: [...networks].map(([network, assets]) => ({
                network,
                assets,
              })),
            },
          },
          signal,
        ),
      )
      return Object.fromEntries(
        response.items.map((asset) => [`${asset.chainId}|${asset.id}`, asset]),
      )
    },
  })
}
