import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SSelectItem = styled.div<{ isActive: boolean }>`
  --secondary-color: ${({ isActive }) =>
    isActive ? theme.colors.pink600 : theme.colors.brightBlue300};

  display: flex;
  flex-direction: column;
  background: rgba(${theme.rgbColors.primaryA06}, 0.06);
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 15px;
  box-shadow: 4px 4px 0px #0a0c17;

  transition: background ${theme.transitions.default};

  &:hover {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    box-shadow: 4px 4px 0px rgba(102, 181, 255, 0.19);
  }

  &:active {
    background: rgba(${theme.rgbColors.brightBlue100}, 0.35);
  }

  position: relative;

  ${(p) => {
    if (p.isActive) {
      return css`
        &,
        &:hover,
        &:active {
          background: rgba(${theme.rgbColors.pink700}, 0.27);
        }

        border: 1px solid ${theme.colors.pink700};
        position: relative;
        padding: 14px 18px;
        box-shadow: 4px 4px 0px rgba(243, 102, 255, 0.19);
      `
    }
  }}
`
