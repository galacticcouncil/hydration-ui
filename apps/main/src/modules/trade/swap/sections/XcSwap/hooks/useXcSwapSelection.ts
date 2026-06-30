import { XcSwapPlatform } from "@galacticcouncil/xc-swap"
import { useEffect } from "react"
import { UseFormReturn } from "react-hook-form"

import { XC_SWAP_CONFIG } from "@/config/xcSwap"
import { XcChainAssetPair } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import {
  findXcChainAssetPair,
  getDefaultChainAssetPair,
  getNormalizedXcAssetId,
} from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { useAssets } from "@/providers/assetsProvider"

type UseXcSwapSelectionParams = {
  form: UseFormReturn<XcSwapFormValues>
  sourceChainAssetPairs: XcChainAssetPair[]
  destChainAssetPairs: XcChainAssetPair[]
  assetIn: string
  assetOut: string
  destPlatform: XcSwapPlatform
  isOriginLoading: boolean
  isDestLoading: boolean
}

export const useXcSwapSelection = ({
  form,
  sourceChainAssetPairs,
  destChainAssetPairs,
  assetIn,
  assetOut,
  destPlatform,
  isOriginLoading,
  isDestLoading,
}: UseXcSwapSelectionParams) => {
  const { getAsset } = useAssets()

  const isSelectionDataReady =
    !isOriginLoading && !isDestLoading && sourceChainAssetPairs.length > 0
  const sellAsset = form.watch("sellAsset")
  const buyAsset = form.watch("buyAsset")
  const isSelectionLoading = !isSelectionDataReady || !sellAsset || !buyAsset

  useEffect(() => {
    if (!isSelectionDataReady) return

    const source =
      findXcChainAssetPair(sourceChainAssetPairs, assetIn) ??
      getDefaultChainAssetPair(
        sourceChainAssetPairs,
        XC_SWAP_CONFIG.defaults.source,
      ) ??
      sourceChainAssetPairs[0]
    const { srcChain, sellAsset } = form.getValues()

    if (source && (!srcChain || !sellAsset)) {
      const asset = getAsset(String(source.asset.id))

      if (asset) {
        form.setValue("srcChain", source.chain)
        form.setValue("sellAsset", asset)
      }
    }
  }, [isSelectionDataReady, sourceChainAssetPairs, form, getAsset, assetIn])

  useEffect(() => {
    if (!isSelectionDataReady) return

    const dest =
      destChainAssetPairs.find(
        (p) =>
          p.chain.platform === destPlatform &&
          getNormalizedXcAssetId(p.asset) === assetOut,
      ) ??
      findXcChainAssetPair(destChainAssetPairs, assetOut) ??
      getDefaultChainAssetPair(
        destChainAssetPairs,
        XC_SWAP_CONFIG.defaults.destination,
      ) ??
      destChainAssetPairs[0]
    const { destChain, buyAsset } = form.getValues()

    if (dest && (!destChain || !buyAsset)) {
      form.setValue("destChain", dest.chain)
      form.setValue("buyAsset", dest.asset)
    }
  }, [isSelectionDataReady, destChainAssetPairs, form, assetOut, destPlatform])

  const destChain = form.watch("destChain")
  const isCrossChain = destChain?.platform !== "hydration"

  useEffect(() => {
    if (isCrossChain && !form.getValues("isSingleTrade")) {
      form.setValue("isSingleTrade", true)
    }
  }, [isCrossChain, form])

  useEffect(() => {
    if (form.getValues("destAddress")) {
      form.trigger("destAddress")
    }
  }, [destChain, form])

  return { isSelectionLoading, isCrossChain }
}
