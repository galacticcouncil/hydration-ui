import { css } from "@emotion/react"
import styled from "@emotion/styled"

import { createVariants } from "@/utils"

const defaulStyles = css`
  font-family: "Arial", sans-serif;
  color: #fff;
  text-decoration: none;
  display: inline-block;
  border: 0;
  cursor: pointer;
  border-radius: 5px;
  border: 1px solid transparent;
`

const variantStyles = createVariants((theme) => ({
  primary: css`
    background-color: ${theme.colors.primary};
  `,
  secondary: css`
    background-color: ${theme.colors.secondary};
  `,
}))

const sizeStyles = {
  small: css`
    font-size: 12px;
    padding: 2px 8px;
  `,
  medium: css`
    font-size: 14px;
    padding: 8px 12px;
  `,
  large: css`
    font-size: 16px;
    padding: 15px 30px;
  `,
}

const outlineStyles = createVariants((theme) => ({
  primary: css`
    color: ${theme.colors.primary};
    background-color: transparent;
    border: 1px solid ${theme.colors.primary};
  `,
  secondary: css`
    color: ${theme.colors.secondary};
    background-color: transparent;
    border: 1px solid ${theme.colors.secondary};
  `,
}))

export type SButtonProps = {
  variant?: "primary" | "secondary"
  size?: "small" | "medium" | "large"
  outline?: boolean
}

export const SButton = styled.button<SButtonProps>(
  defaulStyles,
  ({ variant = "primary", size = "medium", outline = false }) => [
    sizeStyles[size],
    variantStyles(variant),
    outline && outlineStyles(variant),
  ],
)

export const SLinkButton = SButton.withComponent("a")
