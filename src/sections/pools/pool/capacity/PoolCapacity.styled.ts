import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  padding-bottom: 4px;

  position: relative;
  text-align: center;

  @media ${theme.viewport.gte.sm} {
    background: inherit;
  }
`
