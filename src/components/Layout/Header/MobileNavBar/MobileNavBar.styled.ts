import styled from "@emotion/styled"
import { theme } from "theme"
import { Link } from "@tanstack/react-location"

export const SMobileNavBar = styled.div`
  position: fixed;
  left: 0;
  bottom: 0;
  z-index: ${theme.zIndices.header};

  padding: 2px 0;
  padding-bottom: env(safe-area-inset-bottom);

  height: var(--mobile-nav-height);
  width: calc(100% - 1px);

  transition: all ${theme.transitions.default};

  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
  justify-content: center;
  align-items: center;
  gap: 4px;

  background: rgba(${theme.rgbColors.darkBlue900}, 0.6);
  backdrop-filter: blur(12px);

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

  height: 100%;

  color: ${({ active }) =>
    active ? theme.colors.brightBlue300 : theme.colors.basic400};

  ${({ active }) =>
    active &&
    "background: radial-gradient(52.5% 52.5% at 46.28% 112.5%, #00579F 0%, #023B6A 25%, rgba(0, 23, 54, 0) 100%);"}
`

export const SNavBarItemHidden = styled(Link)`
  display: flex;
  gap: 12px;

  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  color: ${theme.colors.brightBlue200};

  padding: 28px 20px;

  border-radius: 4px;
`

export const STabButton = styled(SNavBarItem)<{ active: boolean }>`
  ${({ active }) =>
    active &&
    `
    height: 100%;
    color: ${theme.colors.brightBlue300};
    `}
`
