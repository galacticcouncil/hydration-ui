import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { TableData } from "components/Table/Table.styled"
import { theme } from "theme"

export const tableStyles = css`
  th > div {
    justify-content: flex-start;
  }

  th:last-of-type > div,
  tr td:last-of-type div {
    justify-content: flex-end;
    align-items: end;
  }

  @media ${theme.viewport.gte.sm} {
    th:last-of-type > div,
    tr td:last-of-type div {
      justify-content: flex-start;
      align-items: inherit;
    }
  }
`

export const STableData = styled(TableData)`
  // remove column shrinking because there's no actions column
  &:last-of-type {
    width: unset;
    padding-right: 16px;
  }
`
