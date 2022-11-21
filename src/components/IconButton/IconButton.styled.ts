import styled from "@emotion/styled"
import { theme } from "theme"

export const SIconButton = styled.button<{ round?: boolean }>`
  border-radius: 4px;

  ${(p) => p.round && "border-radius: 9999px;"};

  min-width: 34px;
  min-height: 34px;

  background: ${theme.colors.darkBlue700};
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
    background: ${theme.colors.basic700};
    border: none;
  }
`
