import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { pxToRem } from "@/utils"

export type RiskLevel = "low" | "medium" | "high"
export type RiskIndicatorSize = "small" | "medium" | "large"

export const RISK_INDICATOR_SIZES: Record<
  RiskIndicatorSize,
  { dot: number; gap: number; fs: "p4" | "p5" | "p6" }
> = {
  small: { dot: 6, gap: 3, fs: "p6" },
  medium: { dot: 8, gap: 4, fs: "p5" },
  large: { dot: 10, gap: 5, fs: "p4" },
}

// low/high: palette tokens, same in light and dark; medium matches the warning Alert
export const RISK_COLORS = {
  low: "colors.successGreen.500",
  medium: "accents.alertAlt.primary",
  high: "colors.utility.red.400",
} as const

export const SRiskDot = styled("span", {
  shouldForwardProp: (prop) => !["level", "size", "lit"].includes(prop),
})<{ level: RiskLevel; size: RiskIndicatorSize; lit: boolean }>(({
  theme,
  level,
  size,
  lit,
}) => {
  return css`
    display: block;
    flex-shrink: 0;
    width: ${pxToRem(RISK_INDICATOR_SIZES[size].dot)};
    height: ${pxToRem(RISK_INDICATOR_SIZES[size].dot)};
    border-radius: ${theme.radii.full};
    background-color: ${lit
      ? {
          low: theme.colors.successGreen[500],
          medium: theme.accents.alertAlt.primary,
          high: theme.colors.utility.red[400],
        }[level]
      : theme.details.borders};
  `
})
