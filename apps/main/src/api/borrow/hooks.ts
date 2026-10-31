import { stablepoolYieldMetricsQuery } from "@galacticcouncil/indexer/neckwork"
import { markets, summarizeReserves } from "@galacticcouncil/money-market/core"
import { useMarketReserves } from "@galacticcouncil/money-market/react"
import { useStableArray } from "@galacticcouncil/utils"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import { toBorrowAssetApyData } from "@/api/borrow/borrowAssetApy"
import { ExternalApyType, useExternalApys } from "@/api/borrow/externalApys"
import { neckworkClient } from "@/api/neckwork"
import { useStablepoolsReserves } from "@/modules/liquidity/Liquidity.utils"
import { TStablepoolDetails } from "@/modules/liquidity/Liquidity.utils"
import { isStableSwap, useAssets } from "@/providers/assetsProvider"

export type UnderlyingAssetApy = {
  id: string
  apyType?: ExternalApyType
  supplyApy: number | null
  borrowApy: number | null
}

export type ApyType = "supply" | "borrow"
export type BorrowAssetApyData = {
  assetId: string
  vDotApy?: number
  lpAPY?: number
  incentivesNetAPR: number
  incentives: {
    incentiveAPR: string
    rewardTokenAddress: string
    rewardTokenSymbol: string
  }[]
  underlyingAssetsApyData: UnderlyingAssetApy[]
  underlyingSupplyApy: number | null
  underlyingBorrowApy: number | null
  totalSupplyApy: number | null
  totalBorrowApy: number | null
  supplyMMApy: number | null
  borrowMMApy: number | null
  stablepoolData: TStablepoolDetails | undefined
}

export const useBorrowAssetsApy = (assetIds: string[]) => {
  const { getAsset, getErc20AToken, getRelatedAToken } = useAssets()
  const { data: marketReserves, isLoading: isLoadingBorrowReserves } =
    useMarketReserves(markets.hydration_v3)

  const { data: stablepoolsReserves, isLoading: isLoadingStablepoolsReserves } =
    useStablepoolsReserves(assetIds)

  const stablepoolsMap = useMemo<Map<string, TStablepoolDetails>>(() => {
    return new Map(
      stablepoolsReserves.map((item) => [item.pool.id.toString(), item]),
    )
  }, [stablepoolsReserves])

  const assetIdsMemo = useStableArray(assetIds)

  const { data: yieldMetrics, isLoading: isYieldMetricsLoading } = useQuery(
    stablepoolYieldMetricsQuery(neckworkClient),
  )

  const yieldsMap = useMemo<Map<string, number>>(() => {
    return new Map<string, number>(
      (yieldMetrics ?? []).flatMap<[string, number]>((item) =>
        item.feeApyPerc === null
          ? []
          : [[item.poolId, Number(item.feeApyPerc)]],
      ),
    )
  }, [yieldMetrics])

  // rates do not accrue, so summarising once per read is enough: a ticking
  // summary would re-render every pool table each second
  const reserves = useMemo(
    () =>
      marketReserves
        ? summarizeReserves({
            ...marketReserves,
            currentTimestamp: Math.floor(Date.now() / 1000),
          })
        : [],
    [marketReserves],
  )

  const allAssetIds = useMemo(() => {
    const ids = assetIdsMemo.flatMap((assetId) => {
      const asset = getAsset(assetId)
      return asset && isStableSwap(asset) && asset.underlyingAssetId
        ? asset.underlyingAssetId
        : [assetId]
    })
    return [...new Set(ids)]
  }, [assetIdsMemo, getAsset])

  const { data: externalApys, isLoading: isLoadingExternalApys } =
    useExternalApys(allAssetIds)

  const isLoading =
    isLoadingBorrowReserves ||
    isLoadingStablepoolsReserves ||
    isYieldMetricsLoading ||
    isLoadingExternalApys

  const data = useMemo<BorrowAssetApyData[]>(() => {
    if (isLoading) return []

    const externalApysMap = new Map(externalApys)

    return assetIdsMemo.map((assetId) => {
      const asset = getAsset(assetId)

      return toBorrowAssetApyData({
        assetId,
        poolAssetIds:
          asset && isStableSwap(asset) && asset.underlyingAssetId
            ? asset.underlyingAssetId
            : undefined,
        reserves,
        externalApys: externalApysMap,
        stablepoolData: stablepoolsMap.get(assetId),
        lpAPY: yieldsMap.get(assetId),
        getATokenUnderlyingId: (id) => getErc20AToken(id)?.underlyingAssetId,
        getRelatedATokenId: (id) => getRelatedAToken(id)?.id,
      })
    })
  }, [
    getRelatedAToken,
    assetIdsMemo,
    stablepoolsMap,
    externalApys,
    getAsset,
    getErc20AToken,
    isLoading,
    reserves,
    yieldsMap,
  ])

  return {
    data,
    isLoading,
  }
}
