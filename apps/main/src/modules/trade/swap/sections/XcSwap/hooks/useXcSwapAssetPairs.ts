import { SELL_ONLY_ASSETS } from "@galacticcouncil/utils"
import { XcSwapAsset, XcSwapClient } from "@galacticcouncil/xc-swap"
import { useQuery } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  XcAsset,
  XcChain,
  XcChainAssetPair,
} from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { useAssets } from "@/providers/assetsProvider"
import { useRpcProvider } from "@/providers/rpcProvider"

export const useXcSwapAssetPairs = (
  chains: Record<string, XcChain>,
  xcSwap: XcSwapClient,
) => {
  const { isApiLoaded } = useRpcProvider()
  const { getAsset } = useAssets()

  const { data: originAssets, isLoading: isOriginLoading } = useQuery({
    queryKey: ["xcSwap", "originAssets"],
    queryFn: () => xcSwap.getOriginAssets(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  const { data: destAssets, isLoading: isDestLoading } = useQuery({
    queryKey: ["xcSwap", "destinationAssets"],
    queryFn: () => xcSwap.getDestinationAssets(),
    enabled: isApiLoaded,
    staleTime: Infinity,
  })

  const sourceChainAssetPairs = useMemo<XcChainAssetPair[]>(() => {
    const hydration = chains["hydration"]
    if (!hydration || !originAssets) return []

    return originAssets.map((asset: XcSwapAsset): XcChainAssetPair => {
      const id = String(asset.id)
      const meta = getAsset(id)

      return {
        chain: hydration,
        asset: {
          key: id,
          symbol: asset.symbol,
          name: meta?.name ?? asset.symbol,
          decimals: asset.decimals,
          logo: meta?.iconSrc ?? "",
          logoId: id,
          id: asset.id,
          address: asset.address,
        },
      }
    })
  }, [chains, originAssets, getAsset])

  const originAssetMap = useMemo<Map<string, XcAsset>>(
    () =>
      new Map(
        sourceChainAssetPairs.map((pair) => [
          String(pair.asset.id),
          pair.asset,
        ]),
      ),
    [sourceChainAssetPairs],
  )

  const destChainAssetPairs = useMemo<XcChainAssetPair[]>(() => {
    if (!destAssets) return []

    const crossChain = destAssets.reduce<XcChainAssetPair[]>(
      (acc, asset: XcSwapAsset) => {
        const chain = chains[asset.chain]
        if (!chain) return acc

        acc.push({
          chain,
          asset: {
            key: asset.oneClickId ?? asset.key,
            symbol: asset.symbol,
            name: asset.symbol,
            decimals: asset.decimals,
            logo: "",
            oneClickId: asset.oneClickId,
          },
        })
        return acc
      },
      [],
    )

    const onChainDestPairs = sourceChainAssetPairs.filter(
      ({ asset }) =>
        asset.id === undefined || !SELL_ONLY_ASSETS.includes(String(asset.id)),
    )

    return [...crossChain, ...onChainDestPairs]
  }, [chains, destAssets, sourceChainAssetPairs])

  return {
    sourceChainAssetPairs,
    originAssetMap,
    destChainAssetPairs,
    isOriginLoading,
    isDestLoading,
  }
}
