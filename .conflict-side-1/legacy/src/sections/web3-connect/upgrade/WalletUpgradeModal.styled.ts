import { css } from "@emotion/react"
import { theme } from "theme"
import styled from "@emotion/styled"

export const SVersionContainer = styled.div`
  display: flex;
  flex-direction: column;

  align-items: stretch;
  border: 1px solid ${theme.colors.basic600};
  border-radius: 2px;

  position: relative;
  padding: 6px;

  align-self: stretch;

  @media ${theme.viewport.gte.sm} {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    max-width: 608px;
  }
`
export const SVersionArrow = styled.div`
  grid-column: 1 / span 2;
  grid-row: 1;

  display: none;
  align-items: center;
  justify-content: center;

  @media ${theme.viewport.gte.sm} {
    display: flex;
  }
`
export const SVersion = styled.div<{ variant: "left" | "right" }>`
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  grid-row: 1;

  ${({ variant }) => {
    switch (variant) {
      case "left": {
        return css`
          @media ${theme.viewport.gte.sm} {
            grid-column-start: 1;
            padding-right: calc(59px + 24px);
            grid-template-columns: repeat(2, 1fr);
          }
        `
      }
      case "right": {
        return css`
          background: rgba(${theme.rgbColors.primaryA06}, 0.06);

          @media ${theme.viewport.gte.sm} {
            grid-column-start: 2;
            padding-left: calc(59px + 24px);
            grid-template-columns: repeat(2, 1fr);
          }
        `
      }
    }
  }}
`
