import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SSelectItem = styled.div<{ isActive: boolean }>`
  --secondary-color: ${({ isActive }) =>
    isActive ? theme.colors.pink600 : theme.colors.brightBlue300};

  display: flex;
  flex-direction: column;
  background: rgba(${theme.rgbColors.alpha0}, 0.06);
  padding: 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 12px;

  transition: background ${theme.transitions.default};

  &:hover {
    background: rgba(${theme.rgbColors.primaryA15}, 0.12);
    box-shadow: 4px 4px 0px rgba(102, 181, 255, 0.19);
  }

  &:active {
    background: rgba(${theme.rgbColors.primaryA20}, 0.2);
    box-shadow: 4px 4px 0px #0a0c17;
  }

  position: relative;

  ${(p) => {
    if (p.isActive) {
      return css`
        &,
        &:active {
          background: rgba(${theme.rgbColors.pink700}, 0.27);
        }
        &:hover {
          --secondary-color: ${theme.colors.pink100};
          background: rgba(${theme.rgbColors.pink400Alpha}, 0.46);
          border: 1px solid ${theme.colors.pink100};
        }

        border: 1px solid ${theme.colors.pink700};
        position: relative;
        padding: 14px 18px;
        box-shadow: 4px 4px 0px rgba(243, 102, 255, 0.19);
      `
    }
  }}
`
