import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { ThemeProps } from "@/theme"
import { createVariants } from "@/utils"

const defaulStyles = css`
  display: inline-flex;

  text-decoration: none;
  font-weight: 500;
  line-height: 1;
  white-space: nowrap;

  border-radius: 9999px;

  cursor: pointer;

  transition: all 0.15s ease-in-out;
`

const variantStyles = (
  settings: ThemeProps["buttons"]["primary"]["low"],
) => css`
  background-color: ${settings.rest};
  color: ${settings.onButton};
  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: ${settings.hover};
  }
`

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;

    opacity: 0.2;
  }
`

const variants = createVariants((theme) => ({
  primary: variantStyles(theme.buttons.primary.high),
  secondary: variantStyles(theme.buttons.primary.medium),
  tertiary: variantStyles(theme.buttons.primary.low),
}))

const sizes = createVariants((theme) => ({
  small: css`
    font-size: ${theme.paragraphSize.p3};
    padding: 8px 12px;
  `,
  medium: css`
    font-size: ${theme.paragraphSize.p2};
    padding: 12px 20px;
  `,
  large: css`
    font-size: ${theme.paragraphSize.p1};
    padding: 16px 32px;
  `,
}))

const outlineVariantStyles = (
  settings: ThemeProps["buttons"]["primary"]["low"],
) => css`
  background-color: transparent;
  color: ${settings.rest};
  box-shadow: inset 0 0 0 1px ${settings.rest};
  &:hover {
    background-color: ${settings.rest};
    color: ${settings.onButton};
  }
`

const outlineVariants = createVariants((theme) => ({
  primary: outlineVariantStyles(theme.buttons.primary.high),
  secondary: outlineVariantStyles(theme.buttons.primary.medium),
  tertiary: outlineVariantStyles(theme.buttons.primary.low),
}))

export type SButtonProps = {
  variant?: "primary" | "secondary" | "tertiary"
  size?: "small" | "medium" | "large"
  outline?: boolean
}

export const SButton = styled.button<SButtonProps>(
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
  display: flex;
  align-items: center;
  justify-content: center;

  cursor: pointer;

  &[disabled] {
    cursor: unset;
  }
`

export const SButtonLink = SButton.withComponent("a")
