import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { linearScale } from "@galacticcouncil/utils"

import { Logo, LogoSize } from "@/components/Logo"
import { ThemeProps } from "@/theme"
import { createVariants } from "@/utils"

import { Icon } from "../Icon"
import { Image } from "../Image"
import { AssetLogoDecoration } from "./AssetLogo"

export const LOGO_DIAMETER = {
  "extra-small": 12,
  small: 18,
  medium: 24,
  large: 36,
} as const

const LOGO_OVERLAP = {
  "extra-small": 2,
  small: 4,
  medium: 6,
  large: 8,
} as const

const DECOR_THICKNESS = {
  "extra-small": 1,
  small: 1.5,
  medium: 1.5,
  large: 2,
} as const

const DECOR_PADDING = {
  "extra-small": 1,
  small: 1.5,
  medium: 1.5,
  large: 2,
} as const

const getATokenDecorationStyles = (
  theme: ThemeProps,
  thickness: number,
  padding: number,
) => {
  const backdropColor = theme.surfaces.themeBasePalette.background
  return css`
    ${SAssetLogo} {
      border: ${padding}px solid ${backdropColor};
      background: ${backdropColor};
    }

    &::before {
      content: "";
      position: absolute;
      inset: -${thickness}px;
      background: linear-gradient(to right, #39a5ff, #0063b5 50%, transparent);
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
  return `calc(${percentage}% - ${offset}px)`
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
      circle ${maskRadius}px at ${getCirclePosition(position, diameter, thickness, overlap)},
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
    --border-size: ${borderSize}px;
    display: flex;

    position: absolute;
    right: -10%;
    top: -10%;

    z-index: 1;

    width: 50%;
    height: 50%;

    border-radius: ${theme.radii.full}px;
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

export const SDecorationContainer = styled.div<{
  size: LogoSize
  count: number
  decoration?: AssetLogoDecoration
}>(({ decoration = "none", count, size }) => {
  const overlap = LOGO_OVERLAP[size]
  const thickness = DECOR_THICKNESS[size]
  const padding = DECOR_PADDING[size]
  const diameter = LOGO_DIAMETER[size]
  return [
    css`
      font-size: ${diameter}px;
      position: relative;
      display: inline-flex;
      width: fit-content;
      flex-shrink: 0;

      > :not(:first-of-type) {
        margin-left: -${overlap}px;
      }
    `,
    decorations(thickness, padding)(decoration),
    decoration === "atoken" &&
      css`
        &::before {
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
