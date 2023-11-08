import { theme } from "theme"
import { css } from "@emotion/react"

export const assetsTableStyles = css`
  th {
    &:nth-last-of-type(2),
    &:nth-last-of-type(3) {
      > div {
        justify-content: flex-end;
      }
    }

    @media ${theme.viewport.gte.sm} {
      &:nth-last-of-type(2),
      &:nth-last-of-type(3) {
        > div {
          justify-content: flex-start;
        }
      }
    }
  }
`
