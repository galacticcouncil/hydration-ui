import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  margin: -16px -12px;

  @media (${theme.viewport.gte.sm}) {
    margin: unset;
  }
`
