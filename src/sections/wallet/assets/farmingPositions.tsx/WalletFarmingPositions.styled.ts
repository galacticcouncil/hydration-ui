import styled from "@emotion/styled"
import { TableContainer, TableData } from "components/Table/Table.styled"
import { theme } from "theme"

export const STableContainer = styled(TableContainer)`
  th {
    &:last-of-type {
      > div {
        justify-content: flex-end;
      }
    }

    @media ${theme.viewport.gte.sm} {
      &:last-of-type {
        > div {
          justify-content: flex-start;
        }
      }
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
