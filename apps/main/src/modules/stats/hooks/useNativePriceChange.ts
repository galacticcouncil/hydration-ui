import {
  TimeSeriesBucketTimeRange,
  tradePricesQuery,
} from "@galacticcouncil/indexer/squid"
import { useQuery } from "@tanstack/react-query"
import Big from "big.js"
import { millisecondsInHour } from "date-fns/constants"

import { useSquidClient } from "@/api/provider"
import { spotPriceQuery } from "@/api/spotPrice"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"
import { useDisplayAssetStore } from "@/states/displayAsset"

export const useNativePriceChange = () => {
  const { native } = useAssets()
  const squidClient = useSquidClient()
  const rpc = useRpcProvider()
  const displayAssetId =
    useDisplayAssetStore((state) => state.stableCoinId) ?? ""

  return useQuery({
    enabled: rpc.isApiLoaded && !!displayAssetId,
    queryKey: ["hdxPriceChange"],
    staleTime: millisecondsInHour,
    gcTime: millisecondsInHour,
    queryFn: async () => {
      const now = Date.now()
      const startTimestamp = String(now - 24 * 60 * 60 * 1000)
      const endTimestamp = String(now)
      const bucketSize = TimeSeriesBucketTimeRange["1H"]

      const { currentHdxPrice, prevHdxPrice } = await Promise.all([
        rpc.queryClient.ensureQueryData(
          spotPriceQuery(rpc, native.id, displayAssetId),
        ),
        rpc.queryClient.ensureQueryData(
          tradePricesQuery(
            squidClient,
            native.id,
            displayAssetId,
            startTimestamp,
            endTimestamp,
            bucketSize,
          ),
        ),
      ]).then(([currentPriceData, historicPriceData]) => {
        const prevPriceData =
          historicPriceData?.assetPairPricesAndVolumesByPeriod.nodes
            .flatMap((node) => node?.buckets ?? [])
            .sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
            .at(0)

        const prevHdxPrice = prevPriceData?.priceAvrgNorm
        const currentHdxPrice = currentPriceData.spotPrice

        return { prevHdxPrice, currentHdxPrice }
      })

      const change =
        prevHdxPrice && currentHdxPrice
          ? Big(currentHdxPrice)
              .minus(prevHdxPrice)
              .div(prevHdxPrice)
              .times(100)
              .round(2)
              .toNumber()
          : 0

      return {
        prevHdxPrice,
        currentHdxPrice,
        change,
      }
    },
  })
}
