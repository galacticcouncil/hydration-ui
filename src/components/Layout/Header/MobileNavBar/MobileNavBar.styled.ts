import styled from "@emotion/styled"
import { theme } from "theme"

export const SMobileNavBar = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  background: ${theme.gradients.mobNavigationGradient};

  @media (${theme.viewport.gte.sm}) {
    display: none;
  }
`

export const SNavBarItem = styled.a<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  flex: 1 1 0px;
  gap: 4px;
  justify-content: center;
  align-items: center;
  padding: 7px 0px;
  font-size: 12px;
  color: ${({ active }) =>
    active ? theme.colors.primary400 : theme.colors.backgroundGray600};
`
