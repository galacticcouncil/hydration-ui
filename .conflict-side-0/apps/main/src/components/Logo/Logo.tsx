import {
  AssetLogo,
  AssetLogoSize,
  MultipleAssetLogoWrapper,
} from "@galacticcouncil/ui/components"
import { useCallback, useMemo } from "react"

import { TAsset, useAssets } from "@/providers/assetsProvider"
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
  id: string | string[]
  size?: AssetLogoSize
}) => {
  const {
    getAssetWithFallback,
    isToken,
    isErc20,
    isBond,
    isStableSwap,
    getAssets,
    getAsset,
  } = useAssets()
  const {
    metadata: { url, chainsMetadata },
  } = useAssetRegistry()

  const getLogoMetadata = useCallback(
    (asset?: TAsset) => {
      if (!chainsMetadata || !url || !asset)
        return {
          assetSrc: undefined,
          chainSrc: undefined,
          alt: "",
        }

      let metadata: LogoMetadata | LogoMetadata[] | undefined

      const { cdn, repository, path } = chainsMetadata
      const chainUrl = [cdn["jsDelivr"], repository + "@latest", path].join("/")

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
    },
    [
      chainsMetadata,
      getAssetWithFallback,
      isBond,
      isErc20,
      isStableSwap,
      isToken,
      url,
    ],
  )

  const logoMetadata = useMemo(() => {
    if (Array.isArray(id)) {
      return getAssets(id).flatMap((asset) => getLogoMetadata(asset))
    } else {
      return getLogoMetadata(getAsset(id))
    }
  }, [id, getAssets, getAsset, getLogoMetadata])

  if (Array.isArray(logoMetadata)) {
    return (
      <MultipleAssetLogoWrapper size={size}>
        {logoMetadata.map((data, i) => (
          <AssetLogo
            key={`${data.alt}_${i}`}
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
