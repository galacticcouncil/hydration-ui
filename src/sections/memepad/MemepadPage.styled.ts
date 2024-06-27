import styled from "@emotion/styled"
import { theme } from "theme"

export const SContent = styled.div`
  @media ${theme.viewport.gte.sm} {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
`
