import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SList = styled.nav`
  display: none;

  @media ${theme.viewport.gte.sm} {
    display: flex;
    margin-left: 30px;
  }
`
export const SItem = styled.span<{ isActive?: boolean }>`
  font-size: 15px;
  font-weight: 500;
  line-height: 18px;

  margin-right: 12px;
  padding: 8px 12px;

  color: #bdccd4;

  white-space: nowrap;

  text-transform: uppercase;

  border-radius: 4px;

  transition: ${theme.transitions.slow};

  &:hover {
    color: ${theme.colors.white};
    background: rgba(${theme.rgbColors.alpha0}, 0.06);
    cursor: pointer;
  }

  ${({ isActive }) =>
    isActive &&
    css`
      color: ${theme.colors.brightBlue100};
      background: rgba(${theme.rgbColors.white}, 0.12);
    `};
`
