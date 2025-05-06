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
  | "success"

export type MicroButtonVariant = "low" | "emphasis"

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

const microVariantStyles = (
  color: string,
  bg: string,
  borderColor: string,
  bgHover: string,
  colorHover?: string,
) => css`
  background-color: ${bg};
  color: ${color};

  border-color: ${borderColor};

  &:not(:disabled):hover {
    background-color: ${bgHover};
    color: ${colorHover};
  }
`

const variantStyles = (
  color: string,
  bg: string,
  bgHover: string,
  colorHover?: string,
) => css`
  background-color: ${bg};
  color: ${color};
  &:not(:disabled):hover {
    background-color: ${bgHover};
    color: ${colorHover};
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

const variants = createVariants(({ buttons, accents }) => ({
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
  success: variantStyles(
    accents.success.onEmphasis,
    accents.success.emphasis,
    accents.success.dim,
  ),
}))

const microVariants = createVariants((theme) => ({
  low: microVariantStyles(
    theme.text.medium,
    theme.buttons.secondary.low.rest,
    theme.buttons.secondary.low.borderRest,
    theme.buttons.secondary.low.hover,
    theme.text.high,
  ),
  emphasis: microVariantStyles(
    theme.buttons.secondary.accent.onRest,
    theme.buttons.secondary.accent.rest,
    theme.buttons.secondary.accent.outline,
    theme.buttons.secondary.accent.hover,
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
  success: outlineVariantStyles(
    theme.accents.success.onEmphasis,
    theme.accents.success.emphasis,
    theme.accents.success.emphasis,
    theme.accents.success.emphasis,
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

export const SMicroButton = styled.button<{ variant?: MicroButtonVariant }>(
  ({ theme, variant = "low" }) => [
    css`
      all: unset;

      cursor: pointer;

      padding: 0 8px;

      font-size: 10px;
      font-weight: 500;
      line-height: 140%;
      text-transform: uppercase;

      transition: ${theme.transitions.colors};

      border: 1px solid;
      border-radius: ${theme.containers.cornerRadius.buttonsPrimary}px;

      &:disabled {
        cursor: not-allowed;

        opacity: 0.3;
      }
    `,
    microVariants(variant),
  ],
)

export const SButtonIcon = styled.button(
  ({ theme }) => css`
    width: 34px;
    height: 34px;

    display: flex;
    justify-content: center;
    align-items: center;

    color: ${theme.icons.onContainer};
    border-radius: 32px;
    cursor: pointer;

    &:hover {
      background: ${theme.controls.dim.hover};
    }

    &[data-state="open"],
    &:active {
      color: ${theme.icons.primary};

      svg {
        fill: ${theme.icons.primary};
      }
    }

    &[disabled] {
      cursor: unset;
    }
  `,
)
