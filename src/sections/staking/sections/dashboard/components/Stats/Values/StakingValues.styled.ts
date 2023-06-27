import styled from "@emotion/styled"
import { theme } from "theme"

export const SStakingValuesContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 28px;

  width: 100%;

  @media (${theme.viewport.gte.sm}) {
    align-items: flex-start;
    grid-template-columns: auto min-content auto;
    justify-content: space-between;
  }
`
