import { keyframes, Theme } from "@emotion/react"
import styled from "@emotion/styled"

import {
  ProgressBarOrientation,
  ProgressBarSize,
} from "@/components/ProgressBar/ProgressBar"
import { createVariants, css } from "@/utils"

const SOFT_VARIANTS = [
  "red",
  "orange",
  "amber",
  "lime",
  "green",
  "teal",
  "cyan",
  "blue",
  "purple",
  "pink",
] as const

type SoftVariant = (typeof SOFT_VARIANTS)[number]

export type ProgressBarVariant =
  | "accent"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gradient"
  | SoftVariant

// A soft tag background is its hue at low alpha in both themes; at full alpha
// it is the hue itself (the soft foreground turns near-black in light mode).
const opaque = (color: string) => color.replace(/\/\s*[\d.]+\)$/, "/ 1)")

const fills = (theme: Theme): Record<ProgressBarVariant, string> => ({
  accent: theme.controls.solid.accent,
  success: theme.accents.success.emphasis,
  warning: theme.accents.alertAlt.primary,
  danger: theme.accents.danger.secondary,
  info: theme.accents.info.primary,
  // spans the fill, so every value shows the whole azure → lavender range
  gradient: `linear-gradient(90deg, ${theme.colors.azureBlue[500]} 0%, ${theme.colors.skyBlue[500]} 65%, ${theme.colors.lavender[500]} 100%)`,
  ...(Object.fromEntries(
    SOFT_VARIANTS.map((v) => [v, opaque(theme.tags.soft[v].background)]),
  ) as Record<SoftVariant, string>),
})

// The UI scale (--ui-scale) makes rem heights fractional, e.g. 0.375rem = 6.6px
// at 1.1, and each bar then snaps to 6 or 7px depending on where it lands.
const snap = (height: string) => `round(${height}, 1px)`

const MOVE = "900ms cubic-bezier(0.22, 1, 0.36, 1)"

// Double Crest: a 59px crest tile and a 25px gap repeat every 84px; the strip
// slides one period per loop, so the end frame is the start frame.
const CREST_TILE = 59
const CREST_PERIOD = 84
const crestStop = (fraction: number) => `${CREST_TILE * fraction}px`

const crest = keyframes`
  from { transform: translateX(0); }
  to { transform: translateX(${CREST_PERIOD}px); }
`

const crestStyles = (theme: Theme) => css`
  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: -${CREST_PERIOD}px;
    right: 0;
    background-image: linear-gradient(
      90deg,
      transparent 0,
      rgba(255, 255, 255, 0.7) ${crestStop(0.18)},
      transparent ${crestStop(0.34)},
      rgba(255, 255, 255, 0.16) ${crestStop(0.55)},
      ${theme.colors.greys[100]} ${crestStop(0.78)},
      transparent ${CREST_TILE}px
    );
    background-size: ${CREST_PERIOD}px 100%;
    background-repeat: repeat-x;
    will-change: transform;
    animation: ${crest} 2000ms linear infinite;
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
    }
  }
`
const containerSizes = createVariants<ProgressBarSize>(
  ({ containers, space, lineHeights }) => ({
    small: css`
      padding-block: ${space.xs};
    `,
    medium: css`
      padding-block: ${space.s};

      & ${SProgressBar} {
        height: ${snap("0.375rem")};
      }

      & ${SProgressBarLabel} {
        font-weight: 400;
        line-height: 1;
      }
    `,
    large: css`
      padding-block: ${containers.paddings.quart};

      & ${SProgressBar} {
        height: ${snap("0.5rem")};
      }

      & ${SProgressBarLabel} {
        font-weight: 400;
        line-height: ${lineHeights.m};
      }
    `,
  }),
)

export const SContainer = styled.div<{
  readonly size: ProgressBarSize
  readonly orientation?: ProgressBarOrientation
}>(({ size, orientation = "horizontal" }) => [
  css`
    display: grid;
    align-items: center;
    ${orientation === "horizontal"
      ? "grid-template-columns: 1fr auto;"
      : "grid-template-rows: 1fr auto; grid-template-columns: 1fr; gap: 8px;"}
  `,
  containerSizes(size),
])

export const SProgressBar = styled.div(
  ({ theme }) => css`
    position: relative;

    height: ${snap(theme.sizes["3xs"])};
    border-radius: ${theme.radii.xl};
    background: ${theme.controls.dim.base};

    overflow: hidden;
  `,
)

export const SProgressBarFill = styled.div<{
  readonly value: number
  readonly variant: ProgressBarVariant
  readonly animated: boolean
}>(({ theme, value, variant, animated }) => [
  css`
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;

    width: ${value}%;
    border-radius: inherit;
    overflow: hidden;

    background: ${fills(theme)[variant]};

    transition: width ${MOVE};
    @starting-style {
      width: 0%;
    }
  `,
  animated && crestStyles(theme),
])

export const SProgressBarLabel = styled.span(
  ({ theme }) => css`
    font-family: ${theme.fontFamilies1.secondary};
    font-weight: 500;
    font-size: ${theme.fontSizes.p4};
    line-height: 1;

    margin-left: ${theme.space.m};

    color: ${theme.text.tint.secondary};
  `,
)
