import styled from "@emotion/styled"
import { theme } from "theme"

export const SList = styled.nav`
  display: none;

  @media (${theme.viewport.gte.sm}) {
    display: flex;
  }
`
export const SItem = styled.span<{ isActive?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  line-height: 18px;
  margin-right: 32px;

  color: ${({ isActive }) =>
    isActive ? theme.colors.white : theme.colors.neutralGray300};

  &:hover {
    color: ${theme.colors.primary100};
    cursor: pointer;
  }
`
