import { HOLLAR_ASSETS } from "@galacticcouncil/utils"
import { useQueries } from "@tanstack/react-query"
import { useMemo } from "react"

import {
  isShareToken,
  isStableSwap,
  TAsset,
  TShareToken,
} from "@/providers/assetsProvider"

import compositionAssetColors from "./compositionAssetColors.json"
import {
  enhanceColorForTile,
  getLogoDominantColor,
  mixCompositionColors,
} from "./getLogoDominantColor"

export const HOLLAR_COMPOSITION_COLOR = "#B3CF92"

export type CompositionTileColors = {
  base: string
  dark: string
  light: string
}

const compositionAssetColorMap = compositionAssetColors.assets as Record<
  string,
  CompositionTileColors | undefined
>

const deriveThemeTileColors = (base: string): CompositionTileColors => ({
  base,
  dark: `color-mix(in srgb, ${base} 82%, #08111f)`,
  light: `color-mix(in oklch, ${base} 62%, white)`,
})

const isHollarSymbol = (symbol: string) =>
  symbol.startsWith("HUSD") || symbol === "HEURC"

const isHollarAsset = (asset: TAsset) =>
  HOLLAR_ASSETS.includes(asset.id) || isHollarSymbol(asset.symbol)

const isHollarPoolSymbol = (symbol: string) => {
  const [left, right] = symbol.split("/")

  if (!left || !right) return false

  return isHollarSymbol(left.trim()) || isHollarSymbol(right.trim())
}

const resolveCompositionAsset = (
  id: string,
  getAsset: (id: string) => TAsset,
  getShareToken?: (id: string) => TShareToken | undefined,
  shareTokens: ReadonlyArray<TShareToken> = [],
) => {
  const shareToken = getShareToken?.(id)

  if (shareToken) return shareToken

  const asset = getAsset(id)

  if (isShareToken(asset)) return asset

  if (isHollarPoolSymbol(asset.symbol)) {
    const bySymbol = shareTokens.find((token) => token.id === id)

    if (bySymbol) return bySymbol

    const byExactSymbol = shareTokens.find(
      (token) => token.symbol === asset.symbol,
    )

    if (byExactSymbol) return byExactSymbol
  }

  return asset
}

const getShareTokenPartner = (asset: TShareToken): TAsset | null => {
  const [assetA, assetB] = asset.assets

  if (isHollarAsset(assetA) && !isHollarAsset(assetB)) return assetB
  if (isHollarAsset(assetB) && !isHollarAsset(assetA)) return assetA

  return null
}

const getAssetLogoIconSrc = (id: string, getAsset: (id: string) => TAsset) => {
  const asset = getAsset(id)

  if (
    "underlyingAssetId" in asset &&
    typeof asset.underlyingAssetId === "string"
  ) {
    return getAsset(asset.underlyingAssetId).iconSrc
  }

  return asset.iconSrc
}

const getPartnerIconSrc = (
  partner: TAsset,
  shareToken?: TShareToken,
  getAsset?: (id: string) => TAsset,
) => {
  if (!getAsset) return undefined

  const directIconSrc = getAssetLogoIconSrc(partner.id, getAsset)

  if (directIconSrc) return directIconSrc

  if (!shareToken?.iconId?.length) return undefined

  const partnerIconId = shareToken.iconId.find(
    (iconId) => iconId === partner.id,
  )

  if (partnerIconId) {
    return getAssetLogoIconSrc(partnerIconId, getAsset)
  }

  const nonHollarIconId = shareToken.iconId.find(
    (iconId) => !HOLLAR_ASSETS.includes(iconId),
  )

  return nonHollarIconId
    ? getAssetLogoIconSrc(nonHollarIconId, getAsset)
    : undefined
}

const getHollarPoolPartner = (
  asset: TAsset,
  getAsset: (id: string) => TAsset,
  shareToken?: TShareToken,
): TAsset | null => {
  if (isShareToken(asset)) {
    return getShareTokenPartner(asset)
  }

  if (shareToken) {
    const partner = getShareTokenPartner(shareToken)

    if (partner) return partner
  }

  if (isStableSwap(asset)) {
    const underlyingIds = asset.underlyingAssetId

    if (!underlyingIds?.length) return null

    const underlyings = underlyingIds
      .map((underlyingId) => getAsset(underlyingId))
      .filter((underlyingAsset) => Boolean(underlyingAsset.id))

    const hasHollar = underlyings.some(isHollarAsset)
    const partners = underlyings.filter(
      (underlyingAsset) => !isHollarAsset(underlyingAsset),
    )

    if (hasHollar && partners.length > 0) {
      return partners[0] ?? null
    }
  }

  return null
}

const isStandaloneHollarAsset = (asset: TAsset, shareToken?: TShareToken) => {
  if (isShareToken(asset) || shareToken) return false

  return isHollarAsset(asset)
}

type CompositionColorSpec =
  | { type: "fixed"; color: string }
  | { type: "logo"; iconSrc: string }
  | { type: "pool-blend"; iconSrcs: string[] }
  | {
      type: "hollar-pool-blend"
      partnerId: string
      partnerIconSrc: string
      iconSrcs: string[]
    }

const getPoolIconSrcs = (
  asset: TAsset,
  getAsset: (id: string) => TAsset,
  shareToken?: TShareToken,
) => {
  const iconIds = isStableSwap(asset)
    ? asset.underlyingAssetId
    : shareToken?.iconId

  if (!Array.isArray(iconIds)) return []

  return iconIds
    .map((iconId) => getAssetLogoIconSrc(iconId, getAsset))
    .filter((iconSrc): iconSrc is string => Boolean(iconSrc))
}

const getCompositionColorSpec = (
  id: string,
  getAsset: (id: string) => TAsset,
  getShareToken?: (id: string) => TShareToken | undefined,
  shareTokens: ReadonlyArray<TShareToken> = [],
): CompositionColorSpec | null => {
  const shareToken =
    getShareToken?.(id) ??
    shareTokens.find((token) => token.id === id) ??
    undefined
  const asset = resolveCompositionAsset(
    id,
    getAsset,
    getShareToken,
    shareTokens,
  )
  const resolvedShareToken = isShareToken(asset) ? asset : shareToken
  const partner = getHollarPoolPartner(asset, getAsset, resolvedShareToken)
  const poolIconSrcs = getPoolIconSrcs(asset, getAsset, resolvedShareToken)

  if (partner) {
    const partnerIconSrc = getPartnerIconSrc(
      partner,
      resolvedShareToken,
      getAsset,
    )

    if (partnerIconSrc) {
      return {
        type: "hollar-pool-blend",
        partnerId: partner.id,
        partnerIconSrc,
        iconSrcs: poolIconSrcs,
      }
    }
  }

  if (isStandaloneHollarAsset(asset, resolvedShareToken)) {
    return {
      type: "fixed",
      color: HOLLAR_COMPOSITION_COLOR,
    }
  }

  if (poolIconSrcs.length > 1) {
    return {
      type: "pool-blend",
      iconSrcs: poolIconSrcs,
    }
  }

  const iconSrc = getAssetLogoIconSrc(id, (assetId) =>
    resolveCompositionAsset(assetId, getAsset, getShareToken, shareTokens),
  )

  if (!iconSrc && resolvedShareToken?.iconId?.length) {
    const nonHollarIconId = resolvedShareToken.iconId.find(
      (iconId) => !HOLLAR_ASSETS.includes(iconId),
    )
    const poolIconSrc = nonHollarIconId
      ? getAssetLogoIconSrc(nonHollarIconId, getAsset)
      : getAssetLogoIconSrc(resolvedShareToken.iconId[0]!, getAsset)

    if (poolIconSrc && partner) {
      return {
        type: "hollar-pool-blend",
        partnerId: partner.id,
        partnerIconSrc: poolIconSrc,
        iconSrcs: poolIconSrcs,
      }
    }

    if (poolIconSrc) {
      return {
        type: "logo",
        iconSrc: poolIconSrc,
      }
    }
  }

  if (!iconSrc) return null

  return {
    type: "logo",
    iconSrc,
  }
}

const resolveCompositionColor = async (
  spec: CompositionColorSpec,
): Promise<CompositionTileColors> => {
  switch (spec.type) {
    case "fixed":
      return deriveThemeTileColors(spec.color)
    case "logo":
      return deriveThemeTileColors(await getLogoDominantColor(spec.iconSrc))
    case "pool-blend": {
      const colors = await Promise.all(spec.iconSrcs.map(getLogoDominantColor))
      const [firstColor, ...restColors] = colors

      if (!firstColor) return deriveThemeTileColors(HOLLAR_COMPOSITION_COLOR)

      return deriveThemeTileColors(
        enhanceColorForTile(
          restColors.reduce(
            (mixedColor, color, index) =>
              mixCompositionColors(
                mixedColor,
                color,
                (index + 1) / (index + 2),
              ),
            firstColor,
          ),
        ),
      )
    }
    case "hollar-pool-blend": {
      const iconColors =
        spec.iconSrcs.length > 1
          ? await Promise.all(spec.iconSrcs.map(getLogoDominantColor))
          : [await getLogoDominantColor(spec.partnerIconSrc)]
      const [firstColor, ...restColors] = iconColors
      const poolColor = firstColor
        ? restColors.reduce(
            (mixedColor, color, index) =>
              mixCompositionColors(
                mixedColor,
                color,
                (index + 1) / (index + 2),
              ),
            firstColor,
          )
        : await getLogoDominantColor(spec.partnerIconSrc)

      return deriveThemeTileColors(
        enhanceColorForTile(
          mixCompositionColors(HOLLAR_COMPOSITION_COLOR, poolColor, 0.24),
        ),
      )
    }
  }
}

export const useCompositionAssetColors = (
  assetIds: string[],
  getAsset: (id: string) => TAsset,
  getShareToken?: (id: string) => TShareToken | undefined,
  shareTokens: ReadonlyArray<TShareToken> = [],
) => {
  const colorSpecs = useMemo(
    () =>
      assetIds
        .filter((id) => !compositionAssetColorMap[id])
        .map((id) => ({
          id,
          spec: getCompositionColorSpec(
            id,
            getAsset,
            getShareToken,
            shareTokens,
          ),
        }))
        .filter(
          (
            entry,
          ): entry is {
            id: string
            spec: CompositionColorSpec
          } => entry.spec !== null,
        ),
    [assetIds, getAsset, getShareToken, shareTokens],
  )

  const queries = useQueries({
    queries: colorSpecs.map(({ id, spec }) => ({
      queryKey: [
        "compositionAssetColor",
        "v6",
        id,
        spec.type,
        spec.type === "logo"
          ? spec.iconSrc
          : spec.type === "pool-blend"
            ? spec.iconSrcs.join("|")
            : spec.type === "hollar-pool-blend"
              ? [spec.partnerId, ...spec.iconSrcs].join("|")
              : spec.color,
      ],
      queryFn: () => resolveCompositionColor(spec),
      staleTime: Number.POSITIVE_INFINITY,
      gcTime: Number.POSITIVE_INFINITY,
    })),
  })

  return useMemo(() => {
    const colors = new Map<string, CompositionTileColors>()

    assetIds.forEach((id) => {
      const savedColor = compositionAssetColorMap[id]

      if (savedColor) {
        colors.set(id, savedColor)
      }
    })

    colorSpecs.forEach(({ id }, index) => {
      const color = queries[index]?.data

      if (color) {
        colors.set(id, color)
      }
    })

    return {
      colors,
      isLoading: queries.some((query) => query.isPending),
    }
  }, [assetIds, colorSpecs, queries])
}
