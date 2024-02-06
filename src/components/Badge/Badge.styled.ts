import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { BadgeProps } from "components/Badge/Badge"
import { theme } from "theme"

export const variantStyles = {
  primary: css`
    color: ${theme.colors.white};
    background-color: ${theme.colors.pink700};
  `,
  secondary: css`
    color: ${theme.colors.white};
    background-color: rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
    border: 1px solid rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
  `,
}

export const sizeStyles = {
  small: css`
    font-size: 10px;
    padding: 2px 8px;
  `,
  medium: css`
    font-size: 11px;
    padding: 3px 10px;
  `,
  large: css`
    font-size: 14px;
    padding: 6px 12px;
  `,
}

export const SBadge = styled.span<BadgeProps>`
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  white-space: nowrap;

  display: inline-flex;
  align-items: center;
  justify-content: center;

  border-radius: 9999px;

  ${({ variant }) => variant && variantStyles[variant]}
  ${({ size }) => size && sizeStyles[size]}
`
