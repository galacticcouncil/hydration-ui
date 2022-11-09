import styled from "@emotion/styled"
import { theme } from "theme"

export const SList = styled.nav`
  display: none;

  @media (${theme.viewport.gte.sm}) {
    display: flex;
  }
`
export const SItem = styled.span<{ isActive?: boolean }>`
  font-size: 18px;
  font-weight: 500;
  line-height: 18px;
  margin-right: 32px;
  text-transform: uppercase;

  color: ${({ isActive }) =>
    isActive ? theme.colors.brightBlue100 : theme.colors.basic100};

  &:hover {
    color: ${theme.colors.brightBlue100};
    cursor: pointer;
  }
`
