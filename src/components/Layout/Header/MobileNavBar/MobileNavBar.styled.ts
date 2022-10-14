import styled from "@emotion/styled"
import { theme } from "theme"

export const SMobileNavBar = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: ${theme.zIndices.header};

  height: var(--mobile-nav-height);
  width: 100%;

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  justify-content: center;
  align-items: center;
  gap: 4px;

  background: ${theme.gradients.mobNavigationGradient};

  @media (${theme.viewport.gte.sm}) {
    display: none;
  }
`

export const SNavBarItem = styled.a<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 4px;

  text-align: center;
  white-space: pre;
  font-size: 12px;
  color: ${({ active }) =>
    active ? theme.colors.primary400 : theme.colors.backgroundGray600};
`
