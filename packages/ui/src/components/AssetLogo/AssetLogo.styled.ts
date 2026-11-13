import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { linearScale } from "@galacticcouncil/utils"

import { Logo, LogoSize } from "@/components/Logo"
import { LOGO_SIZES } from "@/components/Logo/Logo.styled"
import { ThemeProps } from "@/theme"
import { createVariants, pxToRem } from "@/utils"

import { Icon } from "../Icon"
import { Image } from "../Image"
import { AssetLogoDecoration } from "./AssetLogo"

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
        background: linear-gradient(
          to right,
          #39a5ff,
          #0063b5 50%,
          transparent
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

export const SAssetBadge = styled(Icon)<{
  type: "red" | "yellow"
}>(({ theme, type }) => {
  const colorMap = {
    red: theme.colors.utility.warningPrimary[500],
    yellow: theme.colors.utility.warningSecondary[500],
  }

  return css`
    display: flex;
    filter: drop-shadow(0 0 4px rgba(0, 0, 0, 0.85));
    color: ${colorMap[type]};
  `
})

export const SBadgeSlot = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  position: absolute;
  right: -10%;
  bottom: -10%;

  z-index: 1;

  width: 50%;
  height: 50%;
`

// clip-path per logo when collapsed into one circle, keyed by logo count
const COLLAPSED_CLIPS: Record<number, string[]> = {
  2: ["inset(0 50% 0 0)", "inset(0 0 0 50%)"],
  3: ["inset(0 50% 0 0)", "inset(0 0 50% 50%)", "inset(50% 0 0 50%)"],
  4: [
    "inset(0 50% 50% 0)",
    "inset(0 0 50% 50%)",
    "inset(50% 50% 0 0)",
    "inset(50% 0 0 50%)",
  ],
}

export const SDecorationContainer = styled.div<{
  size: LogoSize
  count: number
  /** number of logos merged into one circle */
  collapsed?: number
  decoration?: AssetLogoDecoration
}>(({ decoration = "none", count, collapsed, size, theme }) => {
  const overlap = LOGO_OVERLAP[size]
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
        width: ${pxToRem(diameter)};
        height: ${pxToRem(diameter)};

        /* nth-child(n) outranks the child's own position: relative */
        > :nth-child(n) {
          position: absolute;
          inset: 0;
          margin-left: 0;
        }

        ${(COLLAPSED_CLIPS[collapsed] ?? [])
          .map((clip, i) => `> :nth-of-type(${i + 1}) { clip-path: ${clip}; }`)
          .join("\n")}

        /* 1px gaps between the sections, in the page background color */
        &::after {
          content: "";
          position: absolute;
          inset: 0;
          z-index: 1;
          border-radius: ${theme.radii.full};
          --line: linear-gradient(
            ${theme.surfaces.themeBasePalette.background},
            ${theme.surfaces.themeBasePalette.background}
          );
          background:
            var(--line) center / ${pxToRem(1)} 100% no-repeat,
            var(--line) ${collapsed === 3 ? "right" : "center"} center /
              ${collapsed === 3 ? "50%" : collapsed === 4 ? "100%" : "0"}
              ${pxToRem(1)} no-repeat;
        }
      `,
    decorations(thickness, padding)(decoration),
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
  ]
})
