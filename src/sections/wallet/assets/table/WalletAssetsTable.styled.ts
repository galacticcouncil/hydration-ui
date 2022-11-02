import { theme } from "theme"
import { css } from "@emotion/react"

export const assetsTableStyles = css`
  th {
    &:nth-last-child(2) {
      > div {
        justify-content: flex-end;
      }
    }

    @media (${theme.viewport.gte.sm}) {
      &:nth-last-child(2) {
        > div {
          justify-content: flex-start;
        }
      }
    }
  }
`
