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
  orange: css`
    color: ${theme.colors.warning300};
    background-color: rgba(${theme.rgbColors.warning300}, 0.35);
  `,
  purple: css`
    color: rgba(3, 8, 22, 1);
    background-color: rgba(223, 177, 243, 1);
  `,
  green: css`
    color: ${theme.colors.white};
    background-color: rgba(7, 255, 161, 0.33);
    border: 1px solid rgba(${theme.rgbColors.green400}, 0.56);
  `,
}

export const sizeStyles = {
  small: css`
    font-size: 10px;
    padding: 2px 4px;
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

  border-radius: ${({ rounded }) =>
    rounded ? 9999 : theme.borderRadius.default}px;

  ${({ variant }) => variant && variantStyles[variant]}
  ${({ size }) => size && sizeStyles[size]}
`
