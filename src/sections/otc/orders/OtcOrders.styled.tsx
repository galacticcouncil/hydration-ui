import { theme } from "theme"
import { css } from "@emotion/react"

export const ordersTableStyles = css`
  th {
    &:nth-last-of-type(2) {
      > div {
        justify-content: flex-end;
      }
    }

    @media ${theme.viewport.gte.sm} {
      &:nth-last-of-type(2) {
        > div {
          justify-content: flex-start;
        }
      }
    }
  }
`
