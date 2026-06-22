import { SectionHeader, TableRow } from "@galacticcouncil/ui/components"
import { css, pxToRem, styled } from "@galacticcouncil/ui/utils"
import { Content } from "@radix-ui/react-tooltip"

import {
  COMPOSITION_GRID_COLUMNS,
  COMPOSITION_GRID_COLUMNS_MOBILE,
} from "./compositionGridLayout"

const COMPOSITION_ROW_HEIGHT = pxToRem(48 * 1.3)
const COMPOSITION_ROW_HEIGHT_MOBILE = pxToRem(52)
const COMPOSITION_GRID_GAP = pxToRem(4)
const COMPOSITION_BLOCK_RADIUS = pxToRem(8)
const COMPOSITION_BLOCK_PADDING = pxToRem(8)
const COMPOSITION_BLOCK_PADDING_MOBILE = pxToRem(6)
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
    grid-template-columns: repeat(4, minmax(0, 1fr));
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

const compositionTierStyles: Record<
  CompositionBlockTier,
  {
    fillOpacity: number
    saturation: number
    brightness: number
  }
> = {
  hero: { fillOpacity: 0.62, saturation: 0.98, brightness: 0.96 },
  major: { fillOpacity: 0.58, saturation: 0.92, brightness: 0.95 },
  mid: { fillOpacity: 0.54, saturation: 0.84, brightness: 0.94 },
  minor: { fillOpacity: 0.46, saturation: 0.72, brightness: 0.93 },
  dust: { fillOpacity: 0.36, saturation: 0.58, brightness: 0.92 },
}

export const SCompositionBlock = styled.div<{
  readonly color: string
  readonly darkColor?: string
  readonly lightColor?: string
  readonly tier: CompositionBlockTier
  readonly colSpan: number
  readonly rowSpan: number
}>(({ color, darkColor, lightColor, tier, colSpan, rowSpan, theme }) => {
  const tierStyle = compositionTierStyles[tier]
  const lightFillOpacity = Math.max(tierStyle.fillOpacity * 0.5, 0.2)

  return css`
    --composition-color: ${color};
    --composition-fill-color: ${darkColor ??
    `color-mix(
        in srgb,
        var(--composition-color) 82%,
        ${theme.surfaces.themeBasePalette.background}
      )`};
    --fill-opacity: ${tierStyle.fillOpacity};
    --fill-opacity-active: ${Math.min(tierStyle.fillOpacity + 0.12, 1)};
    --saturation: ${tierStyle.saturation};
    --saturation-active: ${Math.min(tierStyle.saturation + 0.25, 1.15)};
    --brightness: ${tierStyle.brightness};
    --brightness-active: ${Math.min(tierStyle.brightness + 0.08, 1.12)};
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
      --composition-fill-color: ${lightColor ??
      `color-mix(
          in srgb,
          var(--composition-color) 58%,
          white
        )`};
      --fill-opacity: ${lightFillOpacity};
      --fill-opacity-active: ${Math.min(lightFillOpacity + 0.08, 0.42)};
      --saturation: ${Math.min(tierStyle.saturation + 0.12, 1.1)};
      --saturation-active: ${Math.min(tierStyle.saturation + 0.2, 1.18)};
      --brightness: ${Math.min(tierStyle.brightness * 1.08, 1.1)};
      --brightness-active: ${Math.min(tierStyle.brightness * 1.14, 1.16)};
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
        opacity 240ms ease,
        filter 240ms ease;
      z-index: 0;
    }

    & > * {
      position: relative;
      z-index: 1;
    }

    &:hover {
      z-index: 2;

      &::before {
        opacity: var(--fill-opacity-active);
        filter: saturate(var(--saturation-active))
          brightness(var(--brightness-active));
      }
    }
  `
})

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
  ({ theme }) => css`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: ${theme.space.xl};

    @media (width < 768px) {
      grid-template-columns: 1fr;
    }
  `,
)

export const SPanelHeader = styled.div(
  ({ theme }) => css`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: ${theme.space.base};
    padding: ${theme.space.l} ${theme.space.xl};
    border-bottom: 1px solid ${theme.details.separators};

    @media (width < 768px) {
      padding: ${theme.space.base} ${theme.space.l};
    }
  `,
)

export const SPanelSectionHeader = styled(SectionHeader)(
  () => css`
    && {
      padding-bottom: 0;
    }
  `,
)

export const SInteractiveTableRow = styled(TableRow)(
  ({ theme }) => css`
    animation: ${theme.animations.fadeIn} 160ms ease-out both;
  `,
)

export const SAssetCell = styled.div<{ readonly $reserveGap?: boolean }>(
  ({ $reserveGap, theme }) => css`
    display: flex;
    align-items: center;
    gap: ${theme.space.base};
    min-width: 0;
    width: 100%;

    ${$reserveGap &&
    css`
      padding-right: ${theme.space.base};
    `}
  `,
)

export const SAssetLabel = styled.div`
  display: grid;
  min-width: 0;
`

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
    padding: ${theme.space.m} ${theme.space.l};
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
    padding: ${theme.space.m} ${theme.space.l};
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
  `,
)

export const STooltipLegend = styled.div<{ readonly $compact?: boolean }>(
  ({ $compact, theme }) => css`
    display: flex;
    flex-direction: column;
    gap: ${$compact ? theme.space.s : theme.space.base};
    width: max-content;
    max-width: min(52rem, calc(100vw - ${theme.space.xl} * 2));
    min-width: 0;
    box-sizing: border-box;
  `,
)

export const STooltipTitle = styled.span(
  ({ theme }) => css`
    display: block;
    width: 100%;
    color: ${theme.text.medium};
    font-family: ${theme.fontFamilies1.secondary};
    font-size: ${theme.fontSizes.p7};
    font-weight: 600;
    line-height: 1;
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
  `,
)

export const STooltipColumn = styled.div<{ readonly $compact?: boolean }>(
  () => css`
    display: flex;
    flex-direction: column;
    min-width: 0;
  `,
)

export const STooltipRow = styled.div<{ readonly $compact?: boolean }>(
  ({ $compact, theme }) => css`
    display: grid;
    grid-template-columns: minmax(0, 1fr) minmax(5.5rem, auto);
    align-items: start;
    gap: ${$compact ? theme.space.s : theme.space.base};
    padding: ${$compact ? `${theme.space.xs} 0` : `${theme.space.s} 0`};
    min-width: 0;
    border-bottom: 1px solid ${tooltipRowDivider(theme)};

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
  `,
)

export const STooltipValues = styled.div<{ readonly $compact?: boolean }>(
  ({ $compact }) => css`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-start;
    gap: 2px;
    text-align: right;
    min-width: ${$compact ? "5.5rem" : "6rem"};
    white-space: nowrap;
    line-height: 1.1;
  `,
)

export const STooltipAsset = styled.div(
  () => css`
    display: flex;
    align-items: center;
    gap: ${pxToRem(8)};
    min-width: 0;
    overflow: hidden;
  `,
)

export const STooltipAssetIdentity = styled.div(
  () => css`
    display: grid;
    gap: 1px;
    min-width: 0;
    line-height: 1.1;
  `,
)
