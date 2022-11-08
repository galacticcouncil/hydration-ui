import styled from "@emotion/styled"
import { theme } from "theme"

export const SIconButton = styled.button<{ round?: boolean }>`
  ${(p) => p.round && "border-radius: 9999px;"};

  min-width: 34px;
  min-height: 34px;

  background: rgba(${theme.rgbColors.white}, 0.06);
  transition: background ${theme.transitions.default};

  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;
  position: relative;

  padding: 0;

  &:hover {
    background: rgba(${theme.rgbColors.white}, 0.15);
  }
`
