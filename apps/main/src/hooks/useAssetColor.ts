import { useTheme } from "@galacticcouncil/ui/theme"
import { mixColors } from "@galacticcouncil/ui/utils"
import { useCallback } from "react"

import {
  AssetId,
  TAsset,
  TShareToken,
  useAssets,
} from "@/providers/assetsProvider"

/** guards against a cycle in the registry, e.g. an aToken over a pool share */
const MAX_DEPTH = 2

export const useAssetColor = () => {
  const {
    getAssetWithFallback,
    getShareToken,
    isBond,
    isErc20AToken,
    isShareToken,
    isStableSwap,
  } = useAssets()
  const { themeProps } = useTheme()

  return useCallback(
    (id: AssetId): string => {
      const getUnderlyingIds = (asset: TAsset | TShareToken): string[] => {
        if (isShareToken(asset)) return asset.assets.map((asset) => asset.id)
        if (isErc20AToken(asset) || isBond(asset)) {
          return [asset.underlyingAssetId]
        }
        if (isStableSwap(asset)) return asset.underlyingAssetId ?? []

        return []
      }

      const resolve = (assetId: AssetId, depth: number): string | undefined => {
        const generated = themeProps.assets[assetId.toString()]

        if (generated || depth > MAX_DEPTH) return generated

        const asset =
          getShareToken(assetId.toString()) ?? getAssetWithFallback(assetId)

        return mixColors(
          getUnderlyingIds(asset)
            .map((underlyingId) => resolve(underlyingId, depth + 1))
            .filter((color): color is string => !!color),
        )
      }

      return resolve(id, 0) ?? themeProps.text.medium
    },
    [
      getAssetWithFallback,
      getShareToken,
      isBond,
      isErc20AToken,
      isShareToken,
      isStableSwap,
      themeProps,
    ],
  )
}
