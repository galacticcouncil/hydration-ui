export const QUERY_KEYS = {
  pools: ["pools"],
  totalLiquidity: (id: string) => ["totalLiquidity", id],
  totalLiquidities: (ids: string[]) => ["totalLiquidities", ...ids],
  assetDetails: (id: string) => ["assetDetails", id],
  assetMeta: (id: string) => ["assetMeta", id],
  exchangeFee: ["exchangeFee"],
} as const
