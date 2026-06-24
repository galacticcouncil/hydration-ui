import { useNavigate } from "@tanstack/react-router"
import { useCallback } from "react"
import { useFormContext } from "react-hook-form"

import { XcAsset } from "@/modules/trade/swap/sections/XcSwap/data/mock"
import { XcSwapFormValues } from "@/modules/trade/swap/sections/XcSwap/hooks/useXcSwapForm"
import { getXcSwapBuyAssetOutId } from "@/modules/trade/swap/sections/XcSwap/lib/xcSwapAssets"
import { useXcSwap } from "@/modules/trade/swap/sections/XcSwap/XcSwapProvider"
import { useAssets } from "@/providers/assetsProvider"

export const useSwitchXcAssets = () => {
  const navigate = useNavigate()
  const { getValues, reset } = useFormContext<XcSwapFormValues>()
  const { getAsset } = useAssets()
  const { originAssetMap } = useXcSwap()

  return useCallback(() => {
    const values = getValues()
    const { sellAsset, buyAsset, sellAmount, buyAmount } = values

    const newSellAsset =
      buyAsset?.id !== undefined
        ? (getAsset(String(buyAsset.id)) ?? null)
        : null

    const newBuyAsset: XcAsset | null = sellAsset
      ? (originAssetMap.get(sellAsset.id) ?? {
          key: sellAsset.id,
          symbol: sellAsset.symbol,
          name: sellAsset.name,
          decimals: sellAsset.decimals,
          logo: sellAsset.iconSrc ?? "",
          logoId: sellAsset.id,
          id: Number(sellAsset.id),
        })
      : null

    reset({
      ...values,
      sellAsset: newSellAsset,
      sellAmount: buyAmount,
      buyAsset: newBuyAsset,
      buyAmount: sellAmount,
    })

    navigate({
      to: ".",
      search: (search) => ({
        ...search,
        assetIn: newSellAsset?.id,
        assetOut: getXcSwapBuyAssetOutId(newBuyAsset) ?? search.assetOut,
      }),
      resetScroll: false,
    })
  }, [getValues, reset, getAsset, originAssetMap, navigate])
}
