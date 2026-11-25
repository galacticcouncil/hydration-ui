import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { linearScale } from "@galacticcouncil/utils"

import { Logo, LogoSize } from "@/components/Logo"
import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { ThemeProps } from "@/theme"
import { createVariants, pxToRem } from "@/utils"

import { Image } from "../Image"
import { AssetLogoChainPosition, AssetLogoDecoration } from "./AssetLogo"

const LOGO_OVERLAP = {
  "extra-small": 2,
  small: 4,
  medium: 6,
  large: 8,
  "extra-large": 10,
} as const

const DECOR_THICKNESS = {
  "extra-small": 1,
  small: 1.5,
  medium: 1.75,
  large: 2.5,
  "extra-large": 3,
} as const

const DECOR_PADDING = {
  "extra-small": 1,
  small: 1.5,
  medium: 1.5,
  large: 2,
  "extra-large": 2.5,
} as const

const LOGO_GAP = {
  "extra-small": 1,
  small: 2,
  medium: 2,
  large: 3,
  "extra-large": 3,
} as const

const SIDE_CHAIN_RATIO = 0.75
const SIDE_CHAIN_OVERLAP = 0.25

const getSideChainSize = (size: LogoSize) =>
  Math.round(LOGO_SIZES[size] * SIDE_CHAIN_RATIO)

const getSideChainVisibleWidth = (size: LogoSize) =>
  Math.round(getSideChainSize(size) * (1 - SIDE_CHAIN_OVERLAP))

const getATokenDecorationStyles = (
  theme: ThemeProps,
  thickness: number,
  padding: number,
) => {
  const backdropColor = theme.surfaces.themeBasePalette.background
  // decorate only once every logo image has loaded, not around placeholders
  return css`
    &:has(${SAssetLogo}[data-loaded]):not(
        :has(${SAssetLogo}:not([data-loaded]))
      ) {
      ${SAssetLogo} {
        border: ${pxToRem(padding)} solid ${backdropColor};
        background: ${backdropColor};
      }

      &::before {
        content: "";
        position: absolute;
        inset: -${pxToRem(thickness)};
        left: calc(var(--decor-offset, 0rem) - ${pxToRem(thickness)});
        background: var(
          --atoken-ring,
          linear-gradient(to right, #39a5ff, #0063b5 50%, transparent)
        );
      }
    }
  `
}

const calculateCircleOffset = (
  percentage: number,
  diameter: number,
): number => {
  const radius = diameter / 2
  const offset = linearScale([0, 50], [0, radius])(percentage)
  return radius - offset
}

const getCirclePosition = (
  percentage: number,
  diameter: number,
  thickness: number,
  overlap: number,
): string => {
  const offset = calculateCircleOffset(
    percentage,
    diameter - thickness * 2 - overlap * 2,
  )
  return `calc(${percentage}% - ${pxToRem(offset)})`
}

const generateATokenMask = (
  count: number,
  diameter: number,
  overlap: number,
  thickness: number,
): string => {
  const maskDiameter = diameter + thickness * 2
  const maskRadius = maskDiameter / 2

  const positions = Array.from({ length: count }, (_, i) => {
    const step = 100 / (count + 1)
    return step * (i + 1)
  })

  const masks = positions.map(
    (position) =>
      `radial-gradient(
      circle ${pxToRem(maskRadius)} at ${getCirclePosition(position, diameter, thickness, overlap)},
      black 0%,
      black 98%,
      transparent 100%
    )`,
  )

  return masks.join(", ")
}

const decorations = (thickness: number, padding: number) =>
  createVariants<AssetLogoDecoration>((theme) => ({
    none: css``,
    atoken: css`
      ${getATokenDecorationStyles(theme, thickness, padding)}
    `,
  }))

export const SAssetLogo = styled(Logo)()

export const SAssetChainLogo = styled(Image)<{ size: LogoSize }>(({
  size,
  theme,
}) => {
  const backdropColor = theme.surfaces.themeBasePalette.background
  const borderSize = ["medium", "large"].includes(size) ? 2 : 1
  return css`
    --border-size: ${pxToRem(borderSize)};
    display: flex;

    position: absolute;
    right: -10%;
    top: -10%;

    z-index: 1;

    width: 50%;
    height: 50%;

    border-radius: ${theme.radii.full};
    border: var(--border-size) solid ${backdropColor};
    background: ${backdropColor};
  `
})

const getSideChainStyles = (
  size: LogoSize,
  decoration: AssetLogoDecoration,
) => {
  const isAToken = decoration === "atoken"
  const ring = isAToken ? DECOR_THICKNESS[size] : 0
  const diameter = LOGO_SIZES[size]
  const chain = getSideChainSize(size)
  const visible = getSideChainVisibleWidth(size)
  const cutout = Math.round(diameter / 2 + ring + LOGO_GAP[size])
  return css`
    align-items: center;
    --decor-offset: ${pxToRem(visible)};

    /* stacked logos decorate themselves; don't inherit the shift */
    > * {
      --decor-offset: 0rem;
    }

    && > ${SAssetChainLogo} {
      position: static;
      order: -1;
      width: ${pxToRem(chain)};
      height: ${pxToRem(chain)};
      margin: 0 -${pxToRem(chain - visible)} 0 0;
      border: none;
      background: none;
      mask-image: radial-gradient(
        circle at ${pxToRem(visible + diameter / 2)} 50%,
        transparent ${pxToRem(cutout)},
        black ${pxToRem(cutout + 0.5)}
      );
    }
  `
}

export const SSideChainSkeleton = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
`

/** Chain placeholder beside a loading logo, cut out like the real side chain. */
export const SSideChainSkeletonChain = styled.span<{ size: LogoSize }>(
  ({ size }) => {
    const diameter = LOGO_SIZES[size]
    const chain = getSideChainSize(size)
    const visible = getSideChainVisibleWidth(size)
    const cutout = Math.round(diameter / 2 + LOGO_GAP[size])
    return css`
      display: flex;
      width: ${pxToRem(chain)};
      height: ${pxToRem(chain)};
      margin-right: -${pxToRem(chain - visible)};
      mask-image: radial-gradient(
        circle at ${pxToRem(visible + diameter / 2)} 50%,
        transparent ${pxToRem(cutout)},
        black ${pxToRem(cutout + 0.5)}
      );
    `
  },
)

const getStackGapStyles = (size: LogoSize) => {
  const diameter = LOGO_SIZES[size]
  const thickness = DECOR_THICKNESS[size]
  const nextCenter = diameter * 1.5 - LOGO_OVERLAP[size]
  const cutout = diameter / 2 + LOGO_GAP[size]
  const gap = (x: number) => `radial-gradient(
    circle at ${pxToRem(x)} 50%,
    transparent ${pxToRem(cutout)},
    black ${pxToRem(cutout + 0.5)}
  )`
  return css`
    > div:not(:last-of-type) > ${SAssetLogo} {
      mask-image: ${gap(nextCenter)};
    }

    /* the ring box starts one ring thickness left of the logo; keep its own mask */
    > div:not(:last-of-type)::before {
      mask-image: ${gap(nextCenter + thickness)},
        ${generateATokenMask(1, diameter, LOGO_OVERLAP[size], thickness)};
      mask-composite: intersect;
    }
  `
}

const COLLAPSED_GAP = {
  "extra-small": 1,
  small: 1,
  medium: 1,
  large: 2,
  "extra-large": 2,
} as const

const COLLAPSED_SECTORS: Record<number, [number, number][]> = {
  2: [
    [180, 360],
    [0, 180],
  ],
  // Y split
  3: [
    [300, 420],
    [60, 180],
    [180, 300],
  ],
  4: [
    [270, 360],
    [0, 90],
    [180, 270],
    [90, 180],
  ],
}

const getSectorClip = (
  [from, to]: [number, number],
  diameter: number,
  gap: number,
) => {
  const r = diameter / 2
  const far = diameter * 2
  type Point = [number, number]
  const point = (
    deg: number,
    dist: number,
    [ox, oy]: Point = [r, r],
  ): Point => {
    const rad = (deg * Math.PI) / 180
    return [ox + Math.sin(rad) * dist, oy - Math.cos(rad) * dist]
  }
  const half = (to - from) / 2
  // corner where both pulled-in edges meet, on the sector's bisector
  const apex = point(from + half, gap / 2 / Math.sin((half * Math.PI) / 180))
  const arc = Array.from({ length: Math.ceil((to - from) / 45) + 1 }, (_, i) =>
    point(Math.min(from + i * 45, to), far),
  )
  return `polygon(${[apex, point(from, far, apex), ...arc, point(to, far, apex)]
    .map(([x, y]) => `${pxToRem(x)} ${pxToRem(y)}`)
    .join(", ")})`
}

export const SDecorationContainer = styled.div<{
  size: LogoSize
  count: number
  collapsed?: number
  decoration?: AssetLogoDecoration
  chainPosition?: AssetLogoChainPosition
}>(
  ({
    decoration = "none",
    chainPosition = "corner",
    count,
    collapsed,
    size,
  }) => {
    const overlap = LOGO_OVERLAP[size]
    const collapsedOffset =
      chainPosition === "side" ? getSideChainVisibleWidth(size) : 0
    const thickness = DECOR_THICKNESS[size]
    const padding = DECOR_PADDING[size]
    const diameter = LOGO_SIZES[size]
    return [
      css`
        font-size: ${pxToRem(diameter)};
        position: relative;
        display: inline-flex;
        width: fit-content;
        flex-shrink: 0;

        > :not(:first-of-type) {
          margin-left: -${pxToRem(overlap)};
        }
      `,
      !!collapsed &&
        css`
          > div:not(:first-of-type) {
            position: absolute;
            top: 0;
            left: ${pxToRem(collapsedOffset)};
            margin-left: 0;
          }

          /* an aToken slice shows only part of its ring; a gradient would fade it out */
          > div {
            --atoken-ring: #0b74d1;
          }

          ${(COLLAPSED_SECTORS[collapsed] ?? [])
            .map(
              (sector, i) =>
                `> div:nth-of-type(${i + 1}) { clip-path: ${getSectorClip(sector, diameter, COLLAPSED_GAP[size])}; }`,
            )
            .join("\n")}
        `,
      decorations(thickness, padding)(decoration),
      chainPosition === "side" && getSideChainStyles(size, decoration),
      // an aToken stack keeps one continuous ring; the gap would expose it behind each logo
      count > 1 && decoration !== "atoken" && getStackGapStyles(size),
      decoration === "atoken" &&
        css`
          &::before {
            width: ${pxToRem(
              diameter * count - overlap * (count - 1) + (thickness + padding),
            )};

            mask-image: ${generateATokenMask(
              count,
              diameter,
              overlap,
              thickness,
            )};
          }
        `,
      // collapsed sectors are split by gaps: hollow the ring so they show the backdrop
      decoration === "atoken" &&
        !!collapsed &&
        css`
          &::before {
            mask-image: radial-gradient(
                circle at ${pxToRem(thickness + diameter / 2)} 50%,
                transparent ${pxToRem(diameter / 2)},
                black ${pxToRem(diameter / 2 + 0.5)}
              ),
              ${generateATokenMask(1, diameter, overlap, thickness)};
            mask-composite: intersect;
          }
        `,
    ]
  },
)
