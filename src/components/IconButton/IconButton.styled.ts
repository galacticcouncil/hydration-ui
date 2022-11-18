import styled from "@emotion/styled"
import { theme } from "theme"

export const SIconButton = styled.button<{ round?: boolean }>`
  border-radius: 4px;

  ${(p) => p.round && "border-radius: 9999px;"};

  min-width: 34px;
  min-height: 34px;

  background: rgba(${theme.rgbColors.alpha0}, 0.06);
  color: ${theme.colors.brightBlue700};

  transition: background ${theme.transitions.default};

  border: 1px solid #30344c;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  padding: 0;

  &:hover {
    color: ${theme.colors.white};
    background: rgba(${theme.rgbColors.brightBlue100}, 0.39);
    border: 1px solid rgba(${theme.rgbColors.brightBlue200}, 0.39);
  }

  &:focus {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
  }
`
