import styled from "@emotion/styled"
import { theme } from "theme"

export const SHollarPool = styled.div<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  padding: 8px 12px;

  border-radius: ${theme.borderRadius.default}px;
  border: 1px solid rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
  background: ${({ isActive }) =>
    isActive
      ? "rgba(76, 213, 243, 0.12)"
      : `rgba(${theme.rgbColors.alpha0}, 0.06)`};

  transition: all ${theme.transitions.default};

  outline: none;
  cursor: pointer;

  &:hover {
    border: 1px solid ${theme.colors.brightBlue500};
  }
`
