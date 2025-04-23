import styled from "@emotion/styled"
import { theme } from "theme"

export const SContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;

  padding: 12px 12px;

  @media ${theme.viewport.gte.sm} {
    margin: 12px 20px;
  }
`
