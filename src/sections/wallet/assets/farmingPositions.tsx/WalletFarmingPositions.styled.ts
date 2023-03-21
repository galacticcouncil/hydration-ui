import styled from "@emotion/styled"
import { TableContainer, TableData } from "components/Table/Table.styled"
import { theme } from "theme"

export const STableContainer = styled(TableContainer)`
  th {
    &:last-of-type {
      > div {
        justify-content: flex-end;
        padding-right: 48px;
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
  &:last-of-type {
    width: unset;
    padding-right: 48px;
  }
`
