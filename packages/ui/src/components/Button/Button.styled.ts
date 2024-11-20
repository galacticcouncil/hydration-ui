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
  settings: ThemeProps["Buttons"]["Primary"]["High"],
) => css`
  background-color: ${settings.Rest};
  color: ${settings.onButton};
  &:not(:disabled):hover,
  &:not(:disabled):focus {
    background-color: ${settings.Hover};
  }
`

const disabledStyles = css`
  &:disabled {
    cursor: not-allowed;

    opacity: 0.2;
  }
`

const variants = createVariants((theme) => ({
  primary: variantStyles(theme.Buttons.Primary.High),
  secondary: variantStyles(theme.Buttons.Primary.Medium),
  tertiary: variantStyles(theme.Buttons.Primary.Low),
}))

const sizes = createVariants((theme) => ({
  small: css`
    font-size: ${theme.paragraphSize.p6};
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
  settings: ThemeProps["Buttons"]["Primary"]["High"],
) => css`
  background-color: transparent;
  color: ${settings.Rest};
  box-shadow: inset 0 0 0 1px ${settings.Rest};
  &:hover {
    background-color: ${settings.Rest};
    color: ${settings.onButton};
  }
`

const outlineVariants = createVariants((theme) => ({
  primary: outlineVariantStyles(theme.Buttons.Primary.High),
  secondary: outlineVariantStyles(theme.Buttons.Primary.Medium),
  tertiary: outlineVariantStyles(theme.Buttons.Primary.Low),
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

export const SLinkButton = SButton.withComponent("a")
