import { theme } from "theme"
import { css } from "@emotion/react"

//TODO: Check if this way of applying bg color is good enough for them
export const ordersTableStyles = css`
  th,
  td {
    

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
