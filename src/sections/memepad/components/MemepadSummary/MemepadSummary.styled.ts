import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  position: relative;

  width: 100%;
  max-width: 700px;

  margin: 0 auto;

  @media ${theme.viewport.gte.sm} {
    padding: 0 50px;
  }
`
