import styled from "@emotion/styled"
import { theme } from "theme"

export const SStakingValuesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  row-gap: 28px;

  width: 100%;
  flex-direction: column;

  @media (${theme.viewport.gte.sm}) {
    flex-direction: row;
  }
`
