import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "@/squid"

export const omnipoolYieldMetricsQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["omnipoolYieldMetrics"],
    queryFn: async () => {
      const data = await squidSdk.OmnipoolYieldMetrics()

      return data.omnipoolAssetsYieldMetrics.nodes
        .filter((node) => node !== null)
        .map((node) => ({
          assetId: node.assetRegistryId ?? node.assetId,
          fee: node.projectedAprPerc as string,
        }))
    },
  })

export const stablepoolYieldMetricsQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["stablepoolYieldMetrics"],
    queryFn: async () => {
      const data = await squidSdk.StableswapYieldMetrics()

      return data.stableswapYieldMetrics.nodes.filter((node) => node !== null)
    },
  })
