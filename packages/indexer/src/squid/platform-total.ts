import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "."

export const platformTotalQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["platformTotal"],
    queryFn: async () => {
      const data = await squidSdk.PlatformTotal()

      const tvl = data.platformTotalTvl.nodes.filter((node) => node !== null)[0]
      const volumes = data.platformTotalVolumesByPeriod.nodes.find(
        (node) => node !== null,
      )

      return {
        mmSupplyTvlNorm: tvl?.mmSupplyTvlNorm,
        omnipoolTvlNorm: tvl?.omnipoolTvlNorm,
        stablepoolsTvlNorm: tvl?.stablepoolsTvlNorm,
        totalTvlDecoratedNorm: tvl?.totalTvlDecoratedNorm,
        xykpoolsTvlNorm: tvl?.xykpoolsTvlNorm,
        omnipoolVolNorm: volumes?.omnipoolVolNorm,
        stableswapVolNorm: volumes?.stableswapVolNorm,
        totalVolNorm: volumes?.totalVolNorm,
        xykpoolVolNorm: volumes?.xykpoolVolNorm,
      }
    },
  })
