import styled, { css } from "styled-components"
import { theme } from "theme"

export const SContainer = styled.div<{ isActive: boolean }>`
  position: relative;

  --secondary-color: ${theme.colors.neutralGray300};

  ${(p) => {
    if (p.isActive) {
      return css`
        --secondary-color: ${theme.colors.primary200};

        &:before {
          content: "";

          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          z-index: -1;
          border-radius: 12px;

          pointer-events: none;

          background: linear-gradient(
              90deg,
              #4fffb0 1.27%,
              #b3ff8f 48.96%,
              #ff984e 104.14%
            ),
            linear-gradient(
              90deg,
              #4fffb0 1.27%,
              #a2ff76 53.24%,
              #ff984e 104.14%
            ),
            linear-gradient(90deg, #ffce4f 1.27%, #4fffb0 104.14%);
        }
      `
    }
  }};
`

export const SSelectItem = styled.div<{ isActive: boolean }>`
  display: flex;
  flex-direction: column;
  background: ${theme.colors.backgroundGray800};
  padding: 16px 20px;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    background: rgba(${theme.rgbColors.primary100}, 0.06);
  }

  &:active {
    background: rgba(${theme.rgbColors.primary100}, 0.07);
  }

  position: relative;

  ${(p) => {
    if (p.isActive) {
      return css`
        &,
        &:hover,
        &:active {
          background-color: rgb(38, 56, 52);
          background-image: linear-gradient(
            285.92deg,
            rgba(73, 228, 159, 0) 25.46%,
            rgba(228, 175, 73, 0.2) 98.29%
          );
        }

        position: relative;
        padding: 14px 18px;
        margin: 1px;
        border-radius: 11px;
      `
    }

    return ``
  }}
`
