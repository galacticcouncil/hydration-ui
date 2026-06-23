import { TableRow } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"
import { Content } from "@radix-ui/react-tooltip"

import {
  COMPOSITION_GRID_COLUMNS,
  COMPOSITION_GRID_COLUMNS_MOBILE,
} from "./compositionGridLayout"

const COMPOSITION_ROW_HEIGHT = pxToRem(48 * 1.3)
const COMPOSITION_ROW_HEIGHT_MOBILE = pxToRem(52)
const COMPOSITION_GRID_GAP = pxToRem(4)
const COMPOSITION_BLOCK_BORDER_WIDTH = 1
const COMPOSITION_BLOCK_RADIUS = pxToRem(8)
const COMPOSITION_BLOCK_PADDING = pxToRem(8)
const COMPOSITION_BLOCK_PADDING_MOBILE = pxToRem(6)
const COMPOSITION_BLOCK_HOVER_IN_DURATION = "480ms"
const COMPOSITION_BLOCK_HOVER_OUT_DURATION = "720ms"
const COMPOSITION_BLOCK_HOVER_EASING = "cubic-bezier(0.4, 0, 0.2, 1)"
const MOBILE_BREAKPOINT = "768px"

const tooltipRowDivider = (theme: { text: { low: string } }) =>
  `color-mix(in srgb, ${theme.text.low} 28%, transparent)`

export const STreasuryGrid = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.xl};
    width: 100%;
  `,
)

export const STreasuryOverview = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.xl};

    @media (width < ${MOBILE_BREAKPOINT}) {
      gap: ${theme.space.l};
    }
  `,
)

export const SLoadedContent = styled.div(
  ({ theme }) => css`
    animation: ${theme.animations.fadeIn} 180ms ease-out both;
  `,
)

export const SKpiGrid = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.space.xl};

    @media (width < ${MOBILE_BREAKPOINT}) {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: ${theme.space.l} ${theme.space.base};

      & > * {
        min-width: 0;
      }
    }
  `,
)

export const SKpiTooltipTrigger = styled.div(
  ({ theme }) => css`
    min-width: 0;
    cursor: help;
    border-radius: ${theme.radii.m};

    &:focus-visible {
      outline: 2px solid ${theme.text.medium};
      outline-offset: ${theme.space.xs};
    }
  `,
)

export const SKpiItem = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.xs};
    min-width: 0;

    & + & {
      border-left: 1px solid ${theme.details.separators};
      padding-left: ${theme.space.xl};
    }

    @media (width < 640px) {
      & + & {
        border-left: 0;
        border-top: 1px solid ${theme.details.separators};
        padding-left: 0;
        padding-top: ${theme.space.l};
      }
    }
  `,
)

export const SKpiLabel = styled.span(
  ({ theme }) => css`
    color: ${theme.text.medium};
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p6};
    line-height: ${theme.lineHeights.m};
  `,
)

export const SKpiValue = styled.span(
  ({ theme }) => css`
    color: var(--composition-color);
    font-family: ${theme.fontFamilies1.primary};
    font-size: ${theme.fontSizes.h6};
    font-weight: 500;
    line-height: ${theme.lineHeights.s};
    overflow-wrap: anywhere;
  `,
)

export const SComposition = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.base};
  `,
)

type CompositionBlockTier = "hero" | "major" | "mid" | "minor" | "dust"

const parseCompositionToken = (value: string) => Number(value)

const getCompositionColorMix = ({
  assetMix,
  lighten,
  lightenMix,
  background,
}: {
  assetMix: string
  lighten: string
  lightenMix: string
  background: string
}) => {
  const mixBase =
    parseCompositionToken(lightenMix) > 0
      ? `color-mix(in oklch, ${lighten} ${lightenMix}%, ${background})`
      : background

  return `color-mix(
    in oklch,
    var(--composition-color) ${assetMix}%,
    ${mixBase}
  )`
}

export const SCompositionBlock = styled.div<{
  readonly color: string
  readonly darkColor?: string
  readonly lightColor?: string
  readonly symbol?: string
  readonly tier: CompositionBlockTier
  readonly colSpan: number
  readonly rowSpan: number
}>(
  ({ color, darkColor, lightColor, symbol, tier, colSpan, rowSpan, theme }) => {
    const composition = theme.charts.colors.treasury.composition
    const assetOverrides =
      symbol && symbol in composition.assets
        ? composition.assets[symbol as keyof typeof composition.assets]
        : undefined
    const tierTokens = composition.tiers[tier]
    const assetFillOpacityBoost = parseCompositionToken(
      assetOverrides?.fillOpacityBoost ?? "0",
    )
    const assetBorderOpacityBoost = parseCompositionToken(
      assetOverrides?.borderOpacityBoost ?? "0",
    )
    const assetBrightnessBoost = parseCompositionToken(
      assetOverrides?.brightnessBoost ?? "0",
    )
    const assetBorderBrightnessBoost = parseCompositionToken(
      assetOverrides?.borderBrightnessBoost ?? "0",
    )
    const baseTierFillOpacity = parseCompositionToken(tierTokens.fillOpacity)
    const baseTierBorderOpacity = parseCompositionToken(
      tierTokens.borderOpacity,
    )
    const baseTierBrightness = parseCompositionToken(tierTokens.brightness)
    const tierFillOpacity = Math.min(
      baseTierFillOpacity + assetFillOpacityBoost,
      1,
    )
    const tierBorderOpacity = Math.min(
      baseTierBorderOpacity + assetBorderOpacityBoost,
      1,
    )
    const tierSaturation = parseCompositionToken(tierTokens.saturation)
    const tierBrightness = Math.min(
      baseTierBrightness + assetBrightnessBoost,
      1.2,
    )
    const tierBorderBrightness = Math.min(
      baseTierBrightness + assetBorderBrightnessBoost,
      1.25,
    )
    const hoverFillOpacityBoost = parseCompositionToken(
      composition.hover.fillOpacityBoost,
    )
    const hoverBorderOpacityBoost = parseCompositionToken(
      composition.hover.borderOpacityBoost,
    )
    const hoverSaturationBoost = parseCompositionToken(
      composition.hover.saturationBoost,
    )
    const hoverBrightnessBoost = parseCompositionToken(
      composition.hover.brightnessBoost,
    )
    const lightTokens = composition.light
    const lightFillOpacityScale = parseCompositionToken(
      lightTokens.fillOpacityScale,
    )
    const lightMinFillOpacity = parseCompositionToken(
      lightTokens.minFillOpacity,
    )
    const lightFillOpacity = Math.max(
      baseTierFillOpacity * lightFillOpacityScale,
      lightMinFillOpacity,
    )
    const lightBorderOpacity = Math.max(
      baseTierBorderOpacity * lightFillOpacityScale,
      lightMinFillOpacity,
    )
    const lightColorMix =
      lightColor ??
      `color-mix(
      in oklch,
      var(--composition-color) ${lightTokens.colorMixAsset}%,
      white
    )`
    const background = theme.surfaces.themeBasePalette.background
    const fillColor = assetOverrides
      ? getCompositionColorMix({
          ...assetOverrides.fill,
          background,
        })
      : (darkColor ??
        getCompositionColorMix({
          ...composition.fill,
          background,
        }))
    const borderColor = assetOverrides
      ? getCompositionColorMix({
          ...assetOverrides.border,
          background,
        })
      : (darkColor ??
        getCompositionColorMix({
          ...composition.border,
          background,
        }))

    return css`
      --composition-color: ${color};
      --composition-fill-color: ${fillColor};
      --composition-border-color: ${borderColor};
      --fill-opacity: ${tierFillOpacity};
      --fill-opacity-active: ${Math.min(
        tierFillOpacity + hoverFillOpacityBoost,
        1,
      )};
      --border-opacity: ${tierBorderOpacity};
      --border-opacity-active: ${Math.min(
        tierBorderOpacity + hoverBorderOpacityBoost,
        1,
      )};
      --saturation: ${tierSaturation};
      --saturation-active: ${Math.min(
        tierSaturation + hoverSaturationBoost,
        1.15,
      )};
      --brightness: ${tierBrightness};
      --brightness-active: ${Math.min(
        tierBrightness + hoverBrightnessBoost,
        1.12,
      )};
      --border-brightness: ${tierBorderBrightness};
      --border-brightness-active: ${Math.min(
        tierBorderBrightness + hoverBrightnessBoost,
        1.18,
      )};
      --composition-block-padding: ${COMPOSITION_BLOCK_PADDING};

      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: flex-start;
      align-items: flex-start;
      grid-column: span ${Math.min(colSpan, COMPOSITION_GRID_COLUMNS)};
      grid-row: span ${rowSpan};
      padding: var(--composition-block-padding);
      border-radius: ${COMPOSITION_BLOCK_RADIUS};
      cursor: pointer;
      overflow: hidden;
      isolation: isolate;
      animation: ${theme.animations.fadeIn} 180ms ease-out both;

      @media (width < ${MOBILE_BREAKPOINT}) {
        grid-column: span ${Math.min(colSpan, COMPOSITION_GRID_COLUMNS_MOBILE)};
        --composition-block-padding: ${COMPOSITION_BLOCK_PADDING_MOBILE};
      }

      html.light & {
        --composition-fill-color: color-mix(
          in oklch,
          ${lightColorMix} ${lightTokens.assetMix}%,
          var(--composition-color)
        );
        --composition-border-color: color-mix(
          in oklch,
          ${lightColorMix}
            ${Math.min(parseCompositionToken(lightTokens.assetMix) + 8, 100)}%,
          var(--composition-color)
        );
        --fill-opacity: ${lightFillOpacity};
        --fill-opacity-active: ${Math.min(
          lightFillOpacity +
            parseCompositionToken(lightTokens.hoverFillOpacityBoost),
          0.5,
        )};
        --border-opacity: ${lightBorderOpacity};
        --border-opacity-active: ${Math.min(
          lightBorderOpacity +
            parseCompositionToken(lightTokens.hoverFillOpacityBoost),
          0.58,
        )};
        --saturation: ${Math.min(
          tierSaturation + parseCompositionToken(lightTokens.saturationBoost),
          1.1,
        )};
        --saturation-active: ${Math.min(
          tierSaturation +
            parseCompositionToken(lightTokens.hoverSaturationBoost),
          1.18,
        )};
        --brightness: ${Math.max(
          baseTierBrightness *
            parseCompositionToken(lightTokens.brightnessScale),
          parseCompositionToken(lightTokens.minBrightness),
        )};
        --brightness-active: ${Math.min(
          baseTierBrightness *
            parseCompositionToken(lightTokens.hoverBrightnessScale),
          parseCompositionToken(lightTokens.maxHoverBrightness),
        )};
        --border-brightness: var(--brightness);
        --border-brightness-active: var(--brightness-active);
      }

      &::before {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: var(--composition-fill-color);
        opacity: var(--fill-opacity);
        filter: saturate(var(--saturation)) brightness(var(--brightness));
        transition:
          opacity ${COMPOSITION_BLOCK_HOVER_OUT_DURATION}
            ${COMPOSITION_BLOCK_HOVER_EASING},
          filter ${COMPOSITION_BLOCK_HOVER_OUT_DURATION}
            ${COMPOSITION_BLOCK_HOVER_EASING};
        z-index: 0;
      }

      &::after {
        content: "";
        position: absolute;
        inset: 0;
        border-radius: inherit;
        border: ${COMPOSITION_BLOCK_BORDER_WIDTH}px solid
          var(--composition-border-color);
        opacity: var(--border-opacity);
        filter: saturate(var(--saturation)) brightness(var(--border-brightness));
        pointer-events: none;
        transition:
          opacity ${COMPOSITION_BLOCK_HOVER_OUT_DURATION}
            ${COMPOSITION_BLOCK_HOVER_EASING},
          filter ${COMPOSITION_BLOCK_HOVER_OUT_DURATION}
            ${COMPOSITION_BLOCK_HOVER_EASING};
        z-index: 1;
      }

      & > * {
        position: relative;
        z-index: 2;
      }

      &:hover {
        z-index: 2;

        &::before {
          opacity: var(--fill-opacity-active);
          filter: saturate(var(--saturation-active))
            brightness(var(--brightness-active));
          transition:
            opacity ${COMPOSITION_BLOCK_HOVER_IN_DURATION}
              ${COMPOSITION_BLOCK_HOVER_EASING},
            filter ${COMPOSITION_BLOCK_HOVER_IN_DURATION}
              ${COMPOSITION_BLOCK_HOVER_EASING};
        }

        &::after {
          opacity: var(--border-opacity-active);
          filter: saturate(var(--saturation-active))
            brightness(var(--border-brightness-active));
          transition:
            opacity ${COMPOSITION_BLOCK_HOVER_IN_DURATION}
              ${COMPOSITION_BLOCK_HOVER_EASING},
            filter ${COMPOSITION_BLOCK_HOVER_IN_DURATION}
              ${COMPOSITION_BLOCK_HOVER_EASING};
        }
      }
    `
  },
)

export const SCompositionGrid = styled.div(
  () => css`
    display: grid;
    grid-template-columns: repeat(${COMPOSITION_GRID_COLUMNS}, minmax(0, 1fr));
    grid-auto-rows: ${COMPOSITION_ROW_HEIGHT};
    grid-auto-flow: dense;
    gap: ${COMPOSITION_GRID_GAP};

    @media (width < ${MOBILE_BREAKPOINT}) {
      grid-template-columns: repeat(
        ${COMPOSITION_GRID_COLUMNS_MOBILE},
        minmax(0, 1fr)
      );
      grid-auto-rows: ${COMPOSITION_ROW_HEIGHT_MOBILE};
    }
  `,
)

export const SCompositionBlockMeta = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    gap: ${theme.space.s};
    width: 100%;
    height: 100%;
    min-width: 0;
  `,
)

export const SCompositionBlockMain = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: ${theme.space.s};
    width: 100%;
    min-width: 0;

    @media (width < ${MOBILE_BREAKPOINT}) {
      gap: ${theme.space.xs};
    }
  `,
)

export const SCompositionBlockLeft = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.sizes["3xs"]};
    min-width: 0;
    flex: 1 1 auto;

    & > :first-of-type {
      flex-shrink: 0;
    }

    @media (width < ${MOBILE_BREAKPOINT}) {
      gap: ${theme.sizes["3xs"]};
    }
  `,
)

export const SCompositionBlockLogo = styled.div<{
  readonly $isMultiple?: boolean
}>(({ $isMultiple }) => {
  const logoHeight = pxToRem(12)
  const logoWidth = $isMultiple ? pxToRem(22) : pxToRem(12)

  return css`
    display: inline-flex;
    align-items: center;
    justify-content: flex-start;
    width: ${logoWidth};
    height: ${logoHeight};
    flex: 0 0 ${logoWidth};
    overflow: visible;
  `
})

export const SCompositionBlockIdentity = styled.div(
  () => css`
    display: grid;
    gap: 2px;
    min-width: 0;
  `,
)

export const SCompositionBlockRight = styled.div(
  () => css`
    display: grid;
    justify-items: start;
    gap: 2px;
    flex-shrink: 0;
    text-align: left;
  `,
)

export const SCompositionBlockShare = styled.span<{
  readonly size: "xlarge" | "large" | "medium" | "small"
}>(
  ({ size, theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${size === "xlarge"
      ? theme.fontSizes.p5
      : size === "large"
        ? theme.fontSizes.p6
        : size === "medium"
          ? theme.fontSizes.p7
          : "10px"};
    font-weight: 500;
    line-height: 1.1;
    font-variant-numeric: tabular-nums;
    color: color-mix(in srgb, ${theme.text.high} 68%, transparent);
    white-space: nowrap;

    @media (width < ${MOBILE_BREAKPOINT}) {
      font-size: ${size === "xlarge" || size === "large"
        ? theme.fontSizes.p7
        : "10px"};
    }
  `,
)

export const SCompositionBlockSymbol = styled.span<{
  readonly size: "large" | "medium" | "small"
}>(
  ({ size, theme }) => css`
    min-width: 0;
    color: ${theme.text.high};
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${size === "large"
      ? theme.fontSizes.p4
      : size === "medium"
        ? theme.fontSizes.p6
        : theme.fontSizes.p7};
    font-weight: 600;
    line-height: 1.1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;

    @media (width < ${MOBILE_BREAKPOINT}) {
      font-size: ${size === "large"
        ? theme.fontSizes.p5
        : size === "medium"
          ? theme.fontSizes.p7
          : "10px"};
    }
  `,
)

export const SCompositionBlockValue = styled.span<{
  readonly size: "xlarge" | "large" | "medium" | "small"
}>(
  ({ size, theme }) => css`
    font-family: ${theme.fontFamilies1.primary};
    font-size: ${size === "xlarge"
      ? theme.fontSizes.h5
      : size === "large"
        ? theme.fontSizes.p4
        : size === "medium"
          ? theme.fontSizes.p5
          : theme.fontSizes.p6};
    font-weight: 600;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
    color: ${theme.text.high};

    @media (width < ${MOBILE_BREAKPOINT}) {
      font-size: ${size === "xlarge"
        ? theme.fontSizes.p4
        : size === "large"
          ? theme.fontSizes.p5
          : size === "medium"
            ? theme.fontSizes.p6
            : theme.fontSizes.p7};
    }
  `,
)

export const SCompositionOthersLogos = styled.div(
  () => css`
    display: flex;
    align-items: center;
    flex-shrink: 0;
    min-width: 0;

    & > * + * {
      margin-left: -6px;
    }
  `,
)

export const STablesGrid = styled.div(
  () => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr);
  `,
)

export const SPanelSearch = styled.div(
  ({ theme }) => css`
    align-self: center;
    display: flex;
    justify-content: flex-end;
    margin-left: auto;
    width: 100%;
    max-width: ${theme.sizes["4xl"]};
    min-width: 0;

    > * {
      width: 100%;
    }
  `,
)

export const SInteractiveTableRow = styled(TableRow)(
  ({ theme }) => css`
    animation: ${theme.animations.fadeIn} 160ms ease-out both;

    &:last-of-type {
      border-bottom: 1px solid ${theme.details.separators};
    }
  `,
)

export const SMuted = styled.span(
  ({ theme }) => css`
    color: ${theme.text.medium};
  `,
)

export const SCompositionOthersTooltipContent = styled(Content)(
  ({ theme }) => css`
    z-index: ${theme.zIndices.tooltip};
    width: max-content;
    max-width: min(52rem, calc(100vw - ${theme.space.xl} * 2));
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.m};
    padding: ${theme.space.base};
    background: ${theme.details.tooltips};
    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
    border-radius: ${theme.radii.m};
  `,
)

export const SCursorAssetTooltipContent = styled.div(
  ({ theme }) => css`
    position: fixed;
    z-index: ${theme.zIndices.tooltip};
    width: max-content;
    max-width: min(20rem, calc(100vw - ${theme.space.xl} * 2));
    font-size: ${theme.fontSizes.p5};
    line-height: ${theme.lineHeights.m};
    padding: ${theme.space.base};
    pointer-events: none;
    background: ${theme.details.tooltips};
    box-shadow: 0px 8px 30px 0px rgba(41, 41, 60, 0.41);
    border-radius: ${theme.radii.m};
  `,
)

export const SCompositionTooltipShell = styled.div(
  ({ theme }) => css`
    width: max-content;
    max-width: min(52rem, calc(100vw - ${theme.space.xl} * 2));
    min-width: 0;
    box-sizing: border-box;

    @media (width < ${MOBILE_BREAKPOINT}) {
      width: 100%;
      max-width: 100%;
    }
  `,
)

export const STooltipLegend = styled.div<{ readonly $compact?: boolean }>(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.base};
    width: max-content;
    max-width: min(52rem, calc(100vw - ${theme.space.xl} * 2));
    min-width: 0;
    box-sizing: border-box;

    @media (width < ${MOBILE_BREAKPOINT}) {
      width: 100%;
      max-width: 100%;
    }
  `,
)

export const STooltipTitle = styled.span(
  ({ theme }) => css`
    display: block;
    width: 100%;
    color: ${theme.text.medium};
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p6};
    font-weight: 600;
    line-height: ${theme.lineHeights.m};
    margin-bottom: calc(${theme.space.base} * -0.5);
    text-transform: uppercase;
  `,
)

export const STooltipColumns = styled.div<{
  readonly $columns?: number
  readonly $compact?: boolean
}>(
  ({ $columns, theme }) => css`
    display: grid;
    grid-template-columns: repeat(${$columns ?? 3}, minmax(9.5rem, 1fr));
    column-gap: ${theme.space.xl};
    row-gap: ${theme.space.s};
    width: max-content;
    max-width: min(52rem, calc(100vw - ${theme.space.xl} * 2));
    min-width: 0;

    @media (width < ${MOBILE_BREAKPOINT}) {
      grid-template-columns: repeat(
        ${Math.min($columns ?? 2, 2)},
        minmax(0, 1fr)
      );
      column-gap: ${theme.space.base};
      width: 100%;
      max-width: 100%;
    }
  `,
)

export const STooltipColumn = styled.div<{ readonly $compact?: boolean }>(
  () => css`
    display: flex;
    flex-direction: column;
    min-width: 0;
  `,
)

export const STooltipHeader = styled.div(
  ({ theme }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: ${theme.space.base};
    min-width: 0;
  `,
)

export const STooltipRow = styled.div<{
  readonly $compact?: boolean
  readonly $noDivider?: boolean
}>(
  ({ $compact, $noDivider, theme }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(5.5rem, auto);
    align-items: start;
    gap: ${$compact ? theme.space.s : theme.space.base};
    padding: ${$compact ? `${theme.space.xs} 0` : `${theme.space.s} 0`};
    min-width: 0;
    border-bottom: ${$noDivider
      ? "none"
      : `1px solid ${tooltipRowDivider(theme)}`};

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  `,
)

export const STooltipSection = styled.div(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${theme.space.s};
    padding: ${theme.space.base} 0;
    width: 100%;
    min-width: 0;
    background: ${theme.surfaces.containers.dim.dimOnHigh};
    border-radius: ${theme.radii.m};
    overflow: hidden;

    > div {
      padding: 0 ${theme.space.base};
      border-bottom: none;
    }

    > div + div {
      padding-top: ${theme.space.s};
      border-top: 1px solid ${tooltipRowDivider(theme)};
    }
  `,
)

export const STooltipValues = styled.div<{ readonly $compact?: boolean }>(
  ({ theme }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    gap: ${theme.space.xs};
    text-align: right;
    min-width: ${theme.sizes["3xl"]};
    white-space: nowrap;
    line-height: 1.1;
  `,
)

export const STooltipAsset = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};
    min-width: 0;
    overflow: hidden;
  `,
)

export const STooltipAssetIdentity = styled.div(
  ({ theme }) => css`
    display: grid;
    gap: ${theme.space.xs};
    min-width: 0;
    line-height: 1.1;
  `,
)
