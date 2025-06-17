import {
  AssetLogo,
  AssetLogoSize,
  MultipleAssetLogoWrapper,
} from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import {
  isBond,
  isErc20,
  isStableSwap,
  TAsset,
  useAssets,
} from "@/providers/assetsProvider"

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
  const { getAssetWithFallback } = useAssets()

  const logoMetadata = useMemo(() => {
    if (Array.isArray(id)) {
      return id
        .map((assetId) => getLogoMetadata(assetId, getAssetWithFallback))
        .flat()
    } else {
      return getLogoMetadata(id, getAssetWithFallback)
    }
  }, [getAssetWithFallback, id])

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

function getLogoMetadata(
  id: string,
  getAsset: (id: string) => TAsset,
): LogoMetadata[] {
  const asset = getAsset(id)
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

    const underlyingAssetIdArr = Array.isArray(underlyingAssetId)
      ? underlyingAssetId
      : [underlyingAssetId]

    return underlyingAssetIdArr.map((id) => {
      const underlyingAssetMeta = getAsset(id)
      return {
        id: underlyingAssetMeta.id,
        assetSrc: underlyingAssetMeta.iconSrc,
        chainSrc: underlyingAssetMeta.chainSrc,
        alt: underlyingAssetMeta.symbol,
      }
    })
  }

  return []
}
