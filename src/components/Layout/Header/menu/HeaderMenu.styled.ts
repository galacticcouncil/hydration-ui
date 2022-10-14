import styled from "@emotion/styled"
import { theme } from "theme"

export const SList = styled.nav`
  display: none;

  @media (${theme.viewport.gte.sm}) {
    display: flex;
  }
`

export const SItem = styled.a<{ isActive?: boolean }>`
  font-size: 16px;
  font-weight: 600;
  line-height: 18px;

  color: ${({ isActive }) =>
    isActive ? theme.colors.white : theme.colors.neutralGray300};

  &:hover {
    color: ${theme.colors.primary100};
    cursor: pointer;
  }

  &:not(:last-of-type) {
    margin-right: 32px;
  }
`
