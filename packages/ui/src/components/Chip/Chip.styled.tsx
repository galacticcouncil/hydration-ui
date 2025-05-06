import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components"
import { createVariants } from "@/utils"

export type ChipVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "green"

export type ChipSize = "small" | "medium" | "large"
export type SChipProps = {
  variant?: ChipVariant
  size?: ChipSize
  rounded?: boolean
}

const variantStyles = (color: string, bg: string) => css`
  background-color: ${bg};
  color: ${color};
`

const variants = createVariants(({ buttons, accents }) => ({
  primary: variantStyles(
    buttons.primary.high.onButton,
    buttons.primary.high.rest,
  ),
  secondary: variantStyles(
    buttons.primary.medium.onButton,
    buttons.primary.medium.rest,
  ),
  tertiary: variantStyles(
    buttons.primary.low.onButton,
    buttons.primary.low.rest,
  ),
  info: variantStyles(accents.info.onPrimary, accents.info.primary),
  success: variantStyles(accents.success.onEmphasis, accents.success.emphasis),
  warning: variantStyles(accents.alertAlt.onPrimary, accents.alertAlt.primary),
  danger: variantStyles(accents.danger.onPrimary, accents.danger.secondary),
  green: variantStyles(accents.success.emphasis, accents.success.dim),
}))

const sizes = createVariants((theme) => ({
  small: css`
    font-size: ${theme.paragraphSize.p6};
    padding: ${theme.scales.paddings.base}px;
    height: 18px;
  `,
  medium: css`
    font-size: ${theme.paragraphSize.p6};
    padding: ${theme.scales.paddings.base}px;
    height: 22px;
  `,
  large: css`
    font-size: ${theme.paragraphSize.p5};
    padding: ${theme.scales.paddings.base}px ${theme.scales.paddings.m}px;
    height: 26px;
  `,
}))

export const SChip = styled(Box, {
  shouldForwardProp: (prop) => !["variant", "size"].includes(prop),
})<SChipProps>(
  ({ theme, variant = "primary", size = "medium", rounded = false }) => [
    variants(variant),
    sizes(size),
    css`
      display: inline-flex;
      align-items: center;
      gap: 4px;
      flex-shrink: 0;

      font-weight: 500;
      line-height: 1;

      border-radius: ${rounded ? theme.radii.full : theme.radii.lg}px;
    `,
  ],
)
