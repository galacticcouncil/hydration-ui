import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SChartTab = styled.button<{ active: boolean }>`
  all: unset;

  font-size: 12px;
  text-transform: uppercase;

  border-radius: 4px;

  cursor: pointer;

  ${(p) =>
    p.active
      ? css`
          background: ${theme.colors.brightBlue700};
          color: ${theme.colors.white};

          padding: 12px 22px;
        `
      : css`
          background: rgba(${theme.rgbColors.alpha0}, 0.06);
          color: ${theme.colors.basic500};

          padding: 12px 18px;
        `}
`
