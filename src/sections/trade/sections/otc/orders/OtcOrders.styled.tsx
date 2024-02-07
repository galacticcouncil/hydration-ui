import { theme } from "theme"
import { css } from "@emotion/react"

export const ordersTableStyles = css`
  th,
  td {
    &:nth-last-of-type(2) {
      > div {
        justify-content: flex-end;
      }
    }

    &:nth-of-type(4) {
      display: flex;
      justify-content: center;
    }

    &:nth-of-type(5) {
      padding: 0;
      min-width: 150px;
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
