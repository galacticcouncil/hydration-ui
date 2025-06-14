import {
  AssetLogo,
  AssetLogoSize,
  MultipleAssetLogoWrapper,
} from "@galacticcouncil/ui/components"
import { useCallback, useMemo } from "react"
import { isString } from "remeda"

import { TAsset, useAssets } from "@/providers/assetsProvider"

type LogoMetadata = {
  id: string
  assetSrc: string | undefined
  chainSrc: string | undefined
  alt: string
}

type LogoProps = {
  id: string | string[]
  size?: AssetLogoSize
  className?: string
}

export const Logo: React.FC<LogoProps> = ({
  id,
  size = "medium",
  className,
}) => {
  const {
    getAssetWithFallback,
    isErc20,
    isBond,
    isStableSwap,
    getAssets,
    getAsset,
  } = useAssets()

  const getLogoMetadata = useCallback(
    (asset?: TAsset): LogoMetadata[] => {
      if (!asset) return []

      if (asset.iconSrc) {
        return [
          {
            id: asset.id,
            assetSrc: asset.iconSrc,
            chainSrc: asset.chainSrc,
            alt: asset.symbol,
          },
        ]
      }

      if (isErc20(asset) || isBond(asset) || isStableSwap(asset)) {
        const { underlyingAssetId } = asset
        if (!underlyingAssetId) return []

        const underlyingAssetIdArr = isString(underlyingAssetId)
          ? [underlyingAssetId]
          : underlyingAssetId

        return underlyingAssetIdArr.map((id) => {
          const underlyingAssetMeta = getAssetWithFallback(id)
          return {
            id: underlyingAssetMeta.id,
            assetSrc: underlyingAssetMeta.iconSrc,
            chainSrc: underlyingAssetMeta.chainSrc,
            alt: underlyingAssetMeta.symbol,
          }
        })
      }

      return []
    },
    [getAssetWithFallback, isErc20, isBond, isStableSwap],
  )

  const logoMetadata = useMemo(() => {
    if (Array.isArray(id)) {
      return getAssets(id).flatMap((asset) => getLogoMetadata(asset))
    } else {
      return getLogoMetadata(getAsset(id))
    }
  }, [id, getAssets, getAsset, getLogoMetadata])

  if (logoMetadata.length > 1) {
    return (
      <MultipleAssetLogoWrapper size={size}>
        {logoMetadata.map((data) => {
          return (
            <AssetLogo
              key={data.id}
              alt={data.alt}
              src={data.assetSrc}
              chainSrc={data.chainSrc}
              size={size}
            />
          )
        })}
      </MultipleAssetLogoWrapper>
    )
  }

  const singleIconMetadata = logoMetadata[0]

  return (
    <AssetLogo
      className={className}
      alt={singleIconMetadata?.alt}
      src={singleIconMetadata?.assetSrc}
      chainSrc={singleIconMetadata?.chainSrc}
      size={size}
    />
  )
}
