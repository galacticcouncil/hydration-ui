import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SSwitchButton = styled.button<{ active: boolean }>`
  all: unset;

  padding: 11px 52px;

  display: flex;
  align-items: center;
  gap: 32px;
  justify-content: center;

  font-size: 12px;

  border-radius: 4px;

  color: ${theme.colors.white};

  position: relative;

  cursor: pointer;

  width: 100%;

  & > span {
    position: absolute;
    left: 15px;
  }

  & > svg {
    filter: brightness(150%);
  }

  ${(p) =>
    p.active
      ? css`
          background: rgba(${theme.rgbColors.primaryA15Blue}, 0.35);

          & > span {
            color: ${theme.colors.pink600};
          }
        `
      : css`
          background: rgba(${theme.rgbColors.alpha0}, 0.06);
          opacity: 0.4;

          & > span {
            color: rgba(114, 131, 165, 0.6);
          }
        `}
`
