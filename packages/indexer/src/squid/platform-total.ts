import { queryOptions } from "@tanstack/react-query"

import { SquidSdk } from "."

export const platformTotalQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["platformTotal"],
    queryFn: async () => {
      const data = await squidSdk.PlatformTotal()

      const tvl = data.platformTotalTvl.nodes.filter((node) => node !== null)[0]
      const volumes = data.platformTotalVolumesByPeriod.nodes.filter(
        (node) => node !== null,
      )[0]

      return {
        omnipoolTvlNorm: tvl?.omnipoolTvlNorm,
        stablepoolsTvlNorm: tvl?.stablepoolsTvlNorm,
        omnipoolVolNorm: volumes?.omnipoolVolNorm,
        stableswapVolNorm: volumes?.stableswapVolNorm,
      }
    },
  })
