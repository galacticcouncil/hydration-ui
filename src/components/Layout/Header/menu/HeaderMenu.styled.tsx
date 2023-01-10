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
  font-weight: 400;
  line-height: 18px;

  margin-right: 12px;
  padding: 8px 12px;

  color: #bdccd4;

  white-space: nowrap;

  &:hover {
    color: ${theme.colors.white};
    cursor: pointer;
  }

  ${({ isActive }) =>
    isActive &&
    css`
      color: ${theme.colors.brightBlue100};
      background: rgba(84, 99, 128, 0.35);

      border-radius: 4px;
    `};
`
