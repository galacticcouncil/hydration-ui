import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { Box } from "@/components/Box"
import { createStyles, createVariants } from "@/utils"

export type ButtonVariant =
  | "primary"
  | "secondary"
  | "tertiary"
  | "danger"
  | "emphasis"
  | "accent"

export type ButtonSize = "small" | "medium" | "large"

export type SButtonProps = {
  variant?: ButtonVariant
  size?: ButtonSize
  outline?: boolean
}

const defaulStyles = createStyles(
  (theme) => css`
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    text-decoration: none;
    font-weight: 500;
    white-space: nowrap;

    border-radius: ${theme.radii.full}px;

    cursor: pointer;

    transition: ${theme.transitions.colors};

    & > svg {
      width: 1em;
      height: 1em;
    }
  `,
)

const variantStyles = (color: string, bg: string, bgHover: string) => css`
  background-color: ${bg};
  color: ${color};
  &:not(:disabled):hover {
    background-color: ${bgHover};
  }
`

const outlineVariantStyles = (
  color: string,
  border: string,
  bg: string,
  bgHover: string,
) => css`
  background-color: ${bg};
  color: ${color};
  box-shadow: inset 0 0 0 1px ${border};
  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: ${bgHover};
  }
`

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;

    opacity: 0.2;
  }
`

const variants = createVariants(({ buttons }) => ({
  primary: variantStyles(
    buttons.primary.high.onButton,
    buttons.primary.high.rest,
    buttons.primary.high.hover,
  ),
  secondary: variantStyles(
    buttons.primary.medium.onButton,
    buttons.primary.medium.rest,
    buttons.primary.medium.hover,
  ),
  tertiary: variantStyles(
    buttons.primary.low.onButton,
    buttons.primary.low.rest,
    buttons.primary.low.hover,
  ),
  danger: variantStyles(
    buttons.primary.high.onButton,
    buttons.secondary.danger.onRest,
    buttons.secondary.danger.outline,
  ),
  emphasis: variantStyles(
    buttons.primary.high.onButton,
    buttons.secondary.emphasis.onRest,
    buttons.secondary.emphasis.outline,
  ),
  accent: variantStyles(
    buttons.primary.high.onButton,
    buttons.secondary.accent.onRest,
    buttons.secondary.accent.outline,
  ),
}))

const outlineVariants = createVariants((theme) => ({
  primary: outlineVariantStyles(
    theme.buttons.primary.high.onButton,
    theme.buttons.primary.high.rest,
    "transparent",
    theme.buttons.primary.high.hover,
  ),
  secondary: outlineVariantStyles(
    theme.buttons.primary.medium.onOutline,
    theme.buttons.primary.medium.rest,
    "transparent",
    theme.buttons.primary.medium.hover,
  ),
  tertiary: outlineVariantStyles(
    theme.text.medium,
    theme.colors.darkBlue.alpha[200],
    theme.buttons.secondary.low.rest,
    theme.buttons.secondary.low.hover,
  ),
  danger: outlineVariantStyles(
    theme.buttons.secondary.danger.onRest,
    theme.buttons.secondary.danger.onRest,
    theme.buttons.secondary.danger.rest,
    theme.buttons.secondary.danger.hover,
  ),
  emphasis: outlineVariantStyles(
    theme.buttons.secondary.emphasis.onRest,
    theme.buttons.secondary.emphasis.onRest,
    theme.buttons.secondary.emphasis.rest,
    theme.buttons.secondary.emphasis.hover,
  ),
  accent: outlineVariantStyles(
    theme.buttons.secondary.accent.onRest,
    theme.buttons.secondary.accent.onRest,
    theme.buttons.secondary.accent.rest,
    theme.buttons.secondary.accent.hover,
  ),
}))

const sizes = createVariants((theme) => ({
  small: css`
    line-height: 1.2;
    font-size: ${theme.paragraphSize.p6};
    padding: ${theme.buttons.paddings.quart}px ${theme.scales.paddings.m}px;
  `,
  medium: css`
    line-height: 1.2;
    font-size: ${theme.paragraphSize.p5};
    padding: ${theme.buttons.paddings.tertiary}px ${theme.scales.paddings.xl}px;
  `,
  large: css`
    line-height: 1;
    font-size: ${theme.paragraphSize.p2};
    padding: ${theme.buttons.paddings.primary}px 30px;
  `,
}))

export const SButton = styled(Box, {
  shouldForwardProp: (prop) => !["variant", "size", "outline"].includes(prop),
})<SButtonProps>(
  defaulStyles,
  ({ variant = "primary", size = "medium", outline = false }) => [
    sizes(size),
    outline ? outlineVariants(variant) : variants(variant),
  ],
  disabledStyles,
)

export const SButtonTransparent = styled.button`
  background: transparent;

  margin: 0;
  padding: 0;
  border: none;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &[disabled] {
    cursor: unset;
  }
`
