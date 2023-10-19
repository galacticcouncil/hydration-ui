import styled from "@emotion/styled"
import { theme } from "theme"

export const STopContentContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  position: absolute;
  top: -60px;
  width: 100vw;

  @media ${theme.viewport.gte.sm} {
    width: 100%;
  }
`
