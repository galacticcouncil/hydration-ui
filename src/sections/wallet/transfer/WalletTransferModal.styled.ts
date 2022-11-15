import { theme } from "theme"
import styled from "@emotion/styled"

export const SPillContainer = styled.div`
  position: absolute;
  top: 13px;
  left: 0;
  right: 0;

  display: flex;
  flex-direction: column;
  align-items: center;

  margin-bottom: 13px;

  @media ${theme.viewport.gte.sm} {
    position: static;
  }
`
