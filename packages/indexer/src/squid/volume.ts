import {
  safeConvertAddressSS58,
  safeConvertSS58toPublicKey,
} from "@galacticcouncil/utils"
import { queryOptions } from "@tanstack/react-query"

import { AggregationTimeRange, SquidSdk } from "@/squid"

export const omnipoolVolumeQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["omnipoolVolumes"],
    queryFn: async () => {
      const data = await squidSdk.OmnipoolVolume({
        filter: {
          period: AggregationTimeRange["24H"],
        },
      })

      return data.omnipoolAssetVolumeHistoricalDataByPeriod.nodes
        .filter((node) => node !== null)
        .map((node) => ({
          assetId: node.assetRegistryId ?? node.assetId,
          assetVolNorm: Number(node.assetVolNormalized).toFixed(2),
        }))
    },
  })

export const stablepoolVolumeQuery = (squidSdk: SquidSdk) =>
  queryOptions({
    queryKey: ["stablepoolVolumes"],
    queryFn: async () => {
      const data = await squidSdk.StablepoolVolume({
        filter: {
          period: AggregationTimeRange["24H"],
        },
      })

      return data.stableswapVolumeHistoricalDataByPeriod.nodes
        .filter((node) => node !== null)
        .map((node) => ({
          poolId: node.poolId,
          poolVolNorm: node.poolVolNorm,
          assetVolumes: node.assetVolumes.map((assetVolume) => ({
            assetId: assetVolume.assetId,
            assetVolNorm: Number(assetVolume.assetVolNorm).toFixed(2),
          })),
        }))
    },
  })

export const xykVolumeQuery = (squidSdk: SquidSdk, addresses: string[]) =>
  queryOptions({
    queryKey: ["xykVolumes"],
    queryFn: async () => {
      const data = await squidSdk.XykVolume({
        filter: {
          poolIds: addresses.map((address) =>
            safeConvertSS58toPublicKey(address),
          ),
          period: AggregationTimeRange["24H"],
        },
      })

      return data.xykpoolVolumeHistoricalDataByPeriod.nodes
        .filter((node) => node !== null)
        .map((node) => {
          const assetId = node.assetAAssetRegistryId ?? node.assetAId
          const assetIdB = node.assetBAssetRegistryId ?? node.assetBId

          return {
            poolId: safeConvertAddressSS58(node.poolId),
            assetId,
            assetIdB,
            poolVolume: Number(node.assetAVolNorm).toFixed(2),
            [assetId]: Number(node.assetAVolNorm).toFixed(2),
            [assetIdB]: Number(node.assetBVolNorm).toFixed(2),
          }
        })
    },
    enabled: !!addresses.length,
  })
