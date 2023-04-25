import styled from "@emotion/styled"
import { css } from "@emotion/react"
import { theme } from "theme"

export const SSelectItem = styled.div<{ isActive: boolean; isProxy: boolean }>`
  --secondary-color: ${({ isActive }) =>
    isActive ? theme.colors.pink600 : theme.colors.brightBlue300};

  flex-grow: 1;
  display: flex;
  flex-direction: column;

  padding: 16px;
  border-radius: 4px;

  transition: background ${theme.transitions.default};

  @media ${theme.viewport.gte.sm} {
    margin-right: 12px;
  }

  position: relative;

  ${(p) => {
    if (p.isProxy) {
      return css`
        border: 1px solid rgba(${theme.rgbColors.primaryA0}, 0.35);
        position: relative;
        padding: 14px 18px;
      `
    }

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

    return css`
      background: rgba(${theme.rgbColors.alpha0}, 0.06);

      cursor: pointer;

      &:hover {
        background: rgba(${theme.rgbColors.primaryA15}, 0.12);
        box-shadow: 4px 4px 0px rgba(102, 181, 255, 0.19);
      }

      &:active {
        background: rgba(${theme.rgbColors.primaryA20}, 0.2);
        box-shadow: 4px 4px 0px #0a0c17;
      }
    `
  }}
`
