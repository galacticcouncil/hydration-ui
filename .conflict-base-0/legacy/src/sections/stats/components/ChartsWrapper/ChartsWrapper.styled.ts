import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { theme } from "theme"

export const SChartTab = styled.button<{ active: boolean }>`
  all: unset;

  font-size: 12px;
  text-transform: uppercase;

  border-radius: 4px;

  cursor: pointer;

  height: 32px;

  padding: 0 22px;

  ${(p) =>
    p.active
      ? css`
          background: ${theme.colors.brightBlue700};
          color: ${theme.colors.white};
        `
      : css`
          background: rgba(${theme.rgbColors.alpha0}, 0.06);
          color: ${theme.colors.basic500};
        `};

  @media (${theme.viewport.gte.sm}) {
    height: auto;
    
   padding: 12px 22px;
`

export const STimeframeEl = styled.button<{ active: boolean }>`
  all: unset;

  font-size: 11px;
  text-transform: uppercase;

  cursor: pointer;

  padding: 7px 12px;

  ${(p) =>
    p.active
      ? css`
          background: rgba(${theme.rgbColors.primaryA15Blue}, 0.35);
          color: ${theme.colors.brightBlue700};

          border-radius: 2px;

          margin: 1px;
        `
      : css`
          color: ${theme.colors.basic400};
        `}

  @media(${theme.viewport.gte.sm}) {
    padding: 2px 6px;
  }
`

export const STimeframeContainer = styled.div`
  display: flex;

  width: min-content;

  border-radius: 2px;

  background: rgba(${theme.rgbColors.white}, 0.03);

  padding: 2px 8px;

  align-self: end;
`
