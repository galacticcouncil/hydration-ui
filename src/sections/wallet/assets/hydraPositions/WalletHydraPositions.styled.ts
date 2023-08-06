import { css } from "@emotion/react"
import styled from "@emotion/styled"
import { TableData } from "components/Table/Table.styled"

export const tableStyles = css`
  th > div {
    justify-content: flex-start;
  }
`

export const STableData = styled(TableData)`
  // remove column shrinking because there's no actions column
  &:last-of-type {
    width: unset;
    padding-right: 16px;
  }
`
