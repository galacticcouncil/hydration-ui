import styled from "@emotion/styled"
import { theme } from "theme"

export const SMobileNavBar = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: ${theme.zIndices.header};

  padding: 2px 0;
  padding-bottom: env(safe-area-inset-bottom);

  height: var(--mobile-nav-height);
  width: 100%;
  transition: all ${theme.transitions.default};

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  justify-content: center;
  align-items: center;
  gap: 4px;

  background: ${theme.gradients.mobNavigationGradient};
  
  @media ${theme.viewport.gte.sm} {
    display: none;
  }
`

export const SNavBarItem = styled.span<{ active?: boolean }>`
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

export const SNavBarItemHidden = styled.a`
  display: flex;
  gap: 12px;
  background: ${theme.colors.backgroundGray800};
  color: ${theme.colors.neutralGray300};
  padding: 30px 20px;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(${theme.rgbColors.white}, 0.06);
  }
`

export const STabButton = styled(SNavBarItem)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `
    background: rgba(218, 255, 238, 0.06);
    border-radius: 8px;
    height: 100%;
    color: ${theme.colors.backgroundGray600};
    `}
`
