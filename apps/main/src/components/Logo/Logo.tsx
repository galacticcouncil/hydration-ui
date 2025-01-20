import {
  AssetLogo,
  AssetLogoSize,
  MultipleAssetLogoWrapper,
} from "@galacticcouncil/ui/components"
import { useMemo } from "react"

import { useAssets } from "@/providers/assetsProvider"
import { useAssetRegistry } from "@/states/assetRegistry"

type LogoMetadata = {
  assetSrc: string | undefined
  chainSrc: string | undefined
  alt: string
}

const getSrcLink = (url: string, iconSrc?: string) => {
  if (!iconSrc) return undefined

  return [url, iconSrc].join("/")
}

export const Logo = ({
  id,
  size = "medium",
}: {
  id: string
  size?: AssetLogoSize
}) => {
  const { getAssetWithFallback, isToken, isErc20, isBond, isStableSwap } =
    useAssets()
  const {
    metadata: { url, chainsMetadata },
  } = useAssetRegistry()

  const logoMetadata = useMemo(() => {
    if (chainsMetadata && url) {
      let metadata: LogoMetadata | LogoMetadata[] | undefined

      const { cdn, repository, path } = chainsMetadata
      const chainUrl = [cdn["jsDelivr"], repository + "@latest", path].join("/")

      const asset = getAssetWithFallback(id)

      if (isToken(asset)) {
        metadata = {
          assetSrc: asset.iconSrc,
          chainSrc: asset.srcChain,
          alt: asset.symbol,
        }
      } else if (isErc20(asset) || isBond(asset)) {
        const { underlyingAssetId } = asset

        if (underlyingAssetId) {
          const underlyingAssetMeta = getAssetWithFallback(underlyingAssetId)

          if (isToken(underlyingAssetMeta)) {
            metadata = {
              assetSrc: underlyingAssetMeta.iconSrc,
              chainSrc: underlyingAssetMeta.srcChain,
              alt: underlyingAssetMeta.symbol,
            }
          }
        }
      } else if (isStableSwap(asset)) {
        asset.underlyingAssetId?.forEach((id) => {
          const underlyingAssetMeta = getAssetWithFallback(id)

          if (isToken(underlyingAssetMeta)) {
            const data = {
              assetSrc: underlyingAssetMeta.iconSrc,
              chainSrc: underlyingAssetMeta.srcChain,
              alt: underlyingAssetMeta.symbol,
            }

            metadata = Array.isArray(metadata) ? [...metadata, data] : [data]
          }
        })
      }

      return Array.isArray(metadata)
        ? metadata.map((data) => ({
            assetSrc: getSrcLink(url, data.assetSrc),
            chainSrc: getSrcLink(chainUrl, data.chainSrc),
            alt: data.alt,
          }))
        : {
            assetSrc: getSrcLink(url, metadata?.assetSrc),
            chainSrc: getSrcLink(chainUrl, metadata?.chainSrc),
            alt: metadata?.alt,
          }
    }

    return { assetSrc: undefined, chainSrc: undefined, assetId: "" }
  }, [
    id,
    chainsMetadata,
    url,
    getAssetWithFallback,
    isToken,
    isErc20,
    isBond,
    isStableSwap,
  ])

  if (Array.isArray(logoMetadata)) {
    return (
      <MultipleAssetLogoWrapper size={size}>
        {logoMetadata.map((data) => (
          <AssetLogo
            key={data.alt}
            alt={data.alt}
            src={data.assetSrc}
            chainSrc={data.chainSrc}
            size={size}
          />
        ))}
      </MultipleAssetLogoWrapper>
    )
  }

  return (
    <AssetLogo
      alt={logoMetadata.alt}
      src={logoMetadata.assetSrc}
      chainSrc={logoMetadata.chainSrc}
      size={size}
    />
  )
}
